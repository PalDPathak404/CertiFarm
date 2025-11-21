const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const credentialSchema = new mongoose.Schema({
  // Unique Credential ID
  credentialId: {
    type: String,
    unique: true,
    default: () => `urn:uuid:${uuidv4()}`
  },
  // Reference to Batch
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  // Reference to Inspection
  inspection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inspection',
    required: true
  },
  // W3C Verifiable Credential Structure
  verifiableCredential: {
    '@context': {
      type: [String],
      default: [
        'https://www.w3.org/2018/credentials/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ]
    },
    id: String,
    type: {
      type: [String],
      default: ['VerifiableCredential', 'DigitalProductPassport']
    },
    issuer: {
      id: String,
      name: String,
      type: { type: String, default: 'QualityAssuranceAgency' }
    },
    issuanceDate: Date,
    expirationDate: Date,
    credentialSubject: {
      id: String, // DID of the exporter
      // Product Information
      product: {
        name: String,
        category: String,
        variety: String,
        quantity: String,
        batchId: String
      },
      // Origin
      origin: {
        country: String,
        state: String,
        farmLocation: String
      },
      // Destination
      destination: {
        country: String,
        importerName: String
      },
      // Quality Certification
      qualityCertification: {
        grade: String,
        moistureContent: String,
        pesticideStatus: String,
        organicCertified: Boolean,
        complianceStandards: [String],
        inspectionDate: Date,
        overallResult: String
      }
    },
    proof: {
      type: { type: String, default: 'Ed25519Signature2020' },
      created: Date,
      verificationMethod: String,
      proofPurpose: { type: String, default: 'assertionMethod' },
      proofValue: String
    }
  },
  // QR Code Data
  qrCode: {
    data: String, // Base64 encoded QR image
    payload: String // JSON string of minimal verification data
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'revoked', 'expired', 'suspended'],
    default: 'active'
  },
  // Revocation Info
  revocation: {
    revokedAt: Date,
    revokedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String
  },
  // Verification Count
  verificationCount: {
    type: Number,
    default: 0
  },
  // Last Verified
  lastVerifiedAt: Date,
  // Issued By
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Method to check if credential is valid
credentialSchema.methods.isValid = function() {
  if (this.status !== 'active') return false;
  if (this.verifiableCredential.expirationDate && new Date() > new Date(this.verifiableCredential.expirationDate)) {
    return false;
  }
  return true;
};

// Method to increment verification count
credentialSchema.methods.recordVerification = async function() {
  this.verificationCount += 1;
  this.lastVerifiedAt = new Date();
  await this.save();
};

// Method to revoke credential
credentialSchema.methods.revoke = async function(userId, reason) {
  this.status = 'revoked';
  this.revocation = {
    revokedAt: new Date(),
    revokedBy: userId,
    reason: reason
  };
  await this.save();
};

module.exports = mongoose.model('Credential', credentialSchema);