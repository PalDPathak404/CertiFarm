const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema({
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inspectionDate: {
    type: Date,
    default: Date.now
  },
  inspectionType: {
    type: String,
    enum: ['physical', 'virtual', 'lab_based'],
    default: 'physical'
  },
  // Quality Parameters
  qualityParameters: {
    // Moisture Content
    moisture: {
      value: Number,
      unit: { type: String, default: '%' },
      acceptable: { type: Boolean, default: true },
      maxAllowed: Number
    },
    // Foreign Matter
    foreignMatter: {
      value: Number,
      unit: { type: String, default: '%' },
      acceptable: { type: Boolean, default: true },
      maxAllowed: Number
    },
    // Pesticide Residue
    pesticideResidue: {
      detected: Boolean,
      value: Number,
      unit: { type: String, default: 'mg/kg' },
      acceptable: { type: Boolean, default: true },
      maxAllowed: Number,
      pesticidesFound: [String]
    },
    // Aflatoxin Level
    aflatoxin: {
      value: Number,
      unit: { type: String, default: 'ppb' },
      acceptable: { type: Boolean, default: true },
      maxAllowed: Number
    },
    // Heavy Metals
    heavyMetals: {
      lead: { value: Number, acceptable: Boolean },
      cadmium: { value: Number, acceptable: Boolean },
      arsenic: { value: Number, acceptable: Boolean }
    },
    // Grade
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'Rejected']
    },
    // Organic Status
    organicCertified: {
      type: Boolean,
      default: false
    }
  },
  // Visual Inspection
  visualInspection: {
    color: { acceptable: Boolean, remarks: String },
    texture: { acceptable: Boolean, remarks: String },
    odor: { acceptable: Boolean, remarks: String },
    packaging: { acceptable: Boolean, remarks: String }
  },
  // Compliance
  compliance: {
    fssaiCompliant: { type: Boolean, default: false },
    exportStandards: { type: Boolean, default: false },
    destinationCountryStandards: { type: Boolean, default: false },
    isoCompliant: { type: Boolean, default: false },
    isoCodes: [String] // e.g., ['ISO 22000', 'ISO 9001']
  },
  // Overall Result
  overallResult: {
    type: String,
    enum: ['pass', 'fail', 'conditional_pass', 'pending'],
    default: 'pending'
  },
  // Inspector's Remarks
  remarks: {
    type: String,
    maxlength: 2000
  },
  // Recommendations
  recommendations: String,
  // Attachments (lab reports, photos)
  attachments: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Digital Signature
  digitalSignature: {
    signedAt: Date,
    signedBy: String,
    signatureHash: String
  }
}, {
  timestamps: true
});

// Method to check if all parameters are acceptable
inspectionSchema.methods.isAllParametersAcceptable = function() {
  const qp = this.qualityParameters;
  return (
    qp.moisture?.acceptable !== false &&
    qp.foreignMatter?.acceptable !== false &&
    qp.pesticideResidue?.acceptable !== false &&
    qp.aflatoxin?.acceptable !== false &&
    qp.heavyMetals?.lead?.acceptable !== false &&
    qp.heavyMetals?.cadmium?.acceptable !== false &&
    qp.heavyMetals?.arsenic?.acceptable !== false
  );
};

module.exports = mongoose.model('Inspection', inspectionSchema);