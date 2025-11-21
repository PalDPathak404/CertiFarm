const Inspection = require('../models/Inspection');
const Batch = require('../models/Batch');
const crypto = require('crypto');

// @desc    Start inspection for a batch
// @route   POST /api/inspections/start/:batchId
// @access  Private (QA Agency)
const startInspection = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check if already has inspection
    if (batch.inspection) {
      return res.status(400).json({
        success: false,
        message: 'Inspection already exists for this batch'
      });
    }

    // Create inspection
    const inspection = await Inspection.create({
      batch: batch._id,
      inspector: req.user._id,
      inspectionType: req.body.inspectionType || 'physical',
      overallResult: 'pending'
    });

    // Update batch status
    batch.status = 'under_inspection';
    batch.inspection = inspection._id;
    batch.statusHistory.push({
      status: 'under_inspection',
      changedBy: req.user._id,
      remarks: 'Inspection started by QA agency'
    });
    await batch.save();

    await inspection.populate('inspector', 'name email organization');
    await inspection.populate('batch', 'batchId product');

    res.status(201).json({
      success: true,
      message: 'Inspection started',
      data: { inspection }
    });
  } catch (error) {
    console.error('Start inspection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start inspection',
      error: error.message
    });
  }
};

// @desc    Submit inspection results
// @route   PUT /api/inspections/:id
// @access  Private (QA Agency)
const submitInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    // Check if inspector owns this inspection
    if (inspection.inspector.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this inspection'
      });
    }

    const {
      qualityParameters,
      visualInspection,
      compliance,
      overallResult,
      remarks,
      recommendations
    } = req.body;

    // Update inspection
    inspection.qualityParameters = qualityParameters;
    inspection.visualInspection = visualInspection;
    inspection.compliance = compliance;
    inspection.overallResult = overallResult;
    inspection.remarks = remarks;
    inspection.recommendations = recommendations;

    // Generate digital signature
    const signatureData = JSON.stringify({
      inspectionId: inspection._id,
      batchId: inspection.batch,
      result: overallResult,
      timestamp: new Date().toISOString()
    });
    inspection.digitalSignature = {
      signedAt: new Date(),
      signedBy: req.user.did || `did:certifarm:${req.user._id}`,
      signatureHash: crypto.createHash('sha256').update(signatureData).digest('hex')
    };

    await inspection.save();

    // Update batch status
    const batch = await Batch.findById(inspection.batch);
    batch.status = 'inspection_complete';
    batch.statusHistory.push({
      status: 'inspection_complete',
      changedBy: req.user._id,
      remarks: `Inspection completed with result: ${overallResult}`
    });
    await batch.save();

    await inspection.populate('inspector', 'name email organization');
    await inspection.populate('batch', 'batchId product exporter');

    res.json({
      success: true,
      message: 'Inspection submitted successfully',
      data: { inspection }
    });
  } catch (error) {
    console.error('Submit inspection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit inspection',
      error: error.message
    });
  }
};

// @desc    Get inspection by ID
// @route   GET /api/inspections/:id
// @access  Private
const getInspectionById = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('inspector', 'name email organization certificationNumber')
      .populate({
        path: 'batch',
        populate: { path: 'exporter', select: 'name email organization' }
      });

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: 'Inspection not found'
      });
    }

    res.json({
      success: true,
      data: { inspection }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch inspection',
      error: error.message
    });
  }
};

// @desc    Get pending inspections for QA
// @route   GET /api/inspections/pending
// @access  Private (QA Agency)
const getPendingInspections = async (req, res) => {
  try {
    // Get batches assigned to this QA agency that need inspection
    const batches = await Batch.find({
      assignedQA: req.user._id,
      status: { $in: ['submitted', 'under_inspection'] }
    })
      .populate('exporter', 'name email organization')
      .populate('inspection')
      .sort({ priority: -1, createdAt: 1 });

    res.json({
      success: true,
      data: { batches }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending inspections',
      error: error.message
    });
  }
};

// @desc    Get all inspections (filtered)
// @route   GET /api/inspections
// @access  Private
const getInspections = async (req, res) => {
  try {
    const { result, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'qa_agency') {
      query.inspector = req.user._id;
    }

    if (result) query.overallResult = result;

    const inspections = await Inspection.find(query)
      .populate('inspector', 'name email organization')
      .populate('batch', 'batchId product status')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Inspection.countDocuments(query);

    res.json({
      success: true,
      data: {
        inspections,
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
      message: 'Failed to fetch inspections',
      error: error.message
    });
  }
};

module.exports = {
  startInspection,
  submitInspection,
  getInspectionById,
  getPendingInspections,
  getInspections
};