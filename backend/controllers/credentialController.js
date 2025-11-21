const Credential = require('../models/Credential');
const Batch = require('../models/Batch');
const Inspection = require('../models/Inspection');
const { generateVerifiableCredential, createQRPayload, verifyCredential } = require('../utils/vcGenerator');
const { generateQRCode, createCompactPayload } = require('../utils/qrGenerator');

// @desc    Issue credential for a batch
// @route   POST /api/credentials/issue/:batchId
// @access  Private (QA Agency)
const issueCredential = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId)
      .populate('exporter', 'name email organization did')
      .populate('inspection');

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Check if batch has completed inspection
    if (batch.status !== 'inspection_complete') {
      return res.status(400).json({
        success: false,
        message: 'Batch must complete inspection before credential issuance'
      });
    }

    // Check if inspection passed
    const inspection = await Inspection.findById(batch.inspection);
    if (!inspection || inspection.overallResult !== 'pass') {
      return res.status(400).json({
        success: false,
        message: 'Credential can only be issued for batches that passed inspection'
      });
    }

    // Check if credential already exists
    if (batch.credential) {
      return res.status(400).json({
        success: false,
        message: 'Credential already issued for this batch'
      });
    }

    // Generate Verifiable Credential
    const vc = generateVerifiableCredential(batch, inspection, req.user);

    // Create credential document
    const credential = new Credential({
      batch: batch._id,
      inspection: inspection._id,
      verifiableCredential: vc,
      issuedBy: req.user._id,
      status: 'active'
    });

    // Generate QR code
    const qrPayload = createQRPayload(credential, batch);
    const qrResult = await generateQRCode(qrPayload);

    if (qrResult.success) {
      credential.qrCode = {
        data: qrResult.dataUrl,
        payload: qrResult.rawData
      };
    }

    await credential.save();

    // Update batch status
    batch.status = 'certified';
    batch.credential = credential._id;
    batch.statusHistory.push({
      status: 'certified',
      changedBy: req.user._id,
      remarks: 'Digital Product Passport issued'
    });
    await batch.save();

    await credential.populate('issuedBy', 'name email organization');
    await credential.populate('batch', 'batchId product');

    res.status(201).json({
      success: true,
      message: 'Credential issued successfully',
      data: { credential }
    });
  } catch (error) {
    console.error('Issue credential error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue credential',
      error: error.message
    });
  }
};

// @desc    Verify a credential
// @route   GET /api/credentials/verify/:credentialId
// @access  Public
const verifyCredentialById = async (req, res) => {
  try {
    let { credentialId } = req.params;

    // Handle both full URN and short ID
    if (!credentialId.startsWith('urn:uuid:')) {
      credentialId = `urn:uuid:${credentialId}`;
    }

    const credential = await Credential.findOne({ credentialId })
      .populate({
        path: 'batch',
        populate: [
          { path: 'exporter', select: 'name organization' },
          { path: 'assignedQA', select: 'name organization' }
        ]
      })
      .populate('inspection')
      .populate('issuedBy', 'name organization certificationNumber');

    if (!credential) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Credential not found'
      });
    }

    // Perform verification
    const verificationResult = verifyCredential(credential);

    // Record verification
    await credential.recordVerification();

    res.json({
      success: true,
      verified: verificationResult.isValid,
      verificationResult,
      data: {
        credential: {
          id: credential.credentialId,
          status: credential.status,
          issuedAt: credential.verifiableCredential.issuanceDate,
          expiresAt: credential.verifiableCredential.expirationDate,
          verificationCount: credential.verificationCount
        },
        product: credential.verifiableCredential.credentialSubject.product,
        origin: credential.verifiableCredential.credentialSubject.origin,
        destination: credential.verifiableCredential.credentialSubject.destination,
        qualityCertification: credential.verifiableCredential.credentialSubject.qualityCertification,
        issuer: credential.verifiableCredential.issuer,
        exporter: {
          name: credential.batch?.exporter?.name,
          organization: credential.batch?.exporter?.organization
        }
      }
    });
  } catch (error) {
    console.error('Verify credential error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      message: 'Verification failed',
      error: error.message
    });
  }
};

// @desc    Get credential by batch ID
// @route   GET /api/credentials/batch/:batchId
// @access  Private
const getCredentialByBatch = async (req, res) => {
  try {
    const credential = await Credential.findOne({ batch: req.params.batchId })
      .populate('batch', 'batchId product status')
      .populate('issuedBy', 'name organization');

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'No credential found for this batch'
      });
    }

    res.json({
      success: true,
      data: { credential }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credential',
      error: error.message
    });
  }
};

// @desc    Revoke a credential
// @route   PUT /api/credentials/:id/revoke
// @access  Private (QA Agency, Admin)
const revokeCredential = async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    const { reason } = req.body;

    await credential.revoke(req.user._id, reason || 'Revoked by issuer');

    // Update batch status
    await Batch.findByIdAndUpdate(credential.batch, {
      status: 'revoked',
      $push: {
        statusHistory: {
          status: 'revoked',
          changedBy: req.user._id,
          remarks: `Credential revoked: ${reason || 'No reason provided'}`
        }
      }
    });

    res.json({
      success: true,
      message: 'Credential revoked successfully',
      data: { credential }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to revoke credential',
      error: error.message
    });
  }
};

// @desc    Get all credentials
// @route   GET /api/credentials
// @access  Private
const getCredentials = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'qa_agency') {
      query.issuedBy = req.user._id;
    } else if (req.user.role === 'exporter') {
      const exporterBatches = await Batch.find({ exporter: req.user._id }).select('_id');
      query.batch = { $in: exporterBatches.map(b => b._id) };
    }

    if (status) query.status = status;

    const credentials = await Credential.find(query)
      .populate('batch', 'batchId product status')
      .populate('issuedBy', 'name organization')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Credential.countDocuments(query);

    res.json({
      success: true,
      data: {
        credentials,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch credentials',
      error: error.message
    });
  }
};

// @desc    Download credential QR code
// @route   GET /api/credentials/:id/qr
// @access  Private
const downloadQRCode = async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id);

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found'
      });
    }

    if (!credential.qrCode?.data) {
      return res.status(404).json({
        success: false,
        message: 'QR code not available'
      });
    }

    res.json({
      success: true,
      data: {
        qrCode: credential.qrCode.data,
        credentialId: credential.credentialId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get QR code',
      error: error.message
    });
  }
};

module.exports = {
  issueCredential,
  verifyCredentialById,
  getCredentialByBatch,
  revokeCredential,
  getCredentials,
  downloadQRCode
};