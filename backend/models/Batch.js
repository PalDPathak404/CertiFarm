const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchId: {
    type: String,
    unique: true,
    required: true
  },
  exporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Product Information
  product: {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['rice', 'wheat', 'spices', 'pulses', 'oilseeds', 'fruits', 'vegetables', 'tea', 'coffee', 'other'],
      required: true
    },
    variety: String,
    quantity: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ['kg', 'tonnes', 'quintals'], default: 'kg' }
    },
    harvestDate: Date,
    packagingDate: Date
  },
  // Origin Information
  origin: {
    farmLocation: String,
    district: String,
    state: String,
    country: { type: String, default: 'India' },
    geoCoordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // Destination Information
  destination: {
    country: { type: String, required: true },
    port: String,
    importerName: String,
    importerContact: String
  },
  // Attached Documents
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['lab_report', 'farm_record', 'packaging_image', 'invoice', 'other']
    },
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Status Tracking
  status: {
    type: String,
    enum: ['submitted', 'under_inspection', 'inspection_complete', 'certified', 'rejected', 'revoked'],
    default: 'submitted'
  },
  // Assigned QA Agency
  assignedQA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Inspection Reference
  inspection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inspection'
  },
  // Credential Reference
  credential: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credential'
  },
  // Status History
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    remarks: String
  }],
  // Additional Notes
  notes: String,
  // Priority
  priority: {
    type: String,
    enum: ['normal', 'urgent', 'express'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Generate batch ID before saving
batchSchema.pre('save', async function(next) {
  if (!this.batchId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.batchId = `CF-${year}${month}-${random}`;
  }
  next();
});

// Add status to history when status changes
batchSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

// Virtual for age of batch
batchSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Batch', batchSchema);