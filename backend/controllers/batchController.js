const Batch = require('../models/Batch');
const User = require('../models/User');

// @desc    Create new batch
// @route   POST /api/batches
// @access  Private (Exporter)
const createBatch = async (req, res) => {
  try {
    const { product, origin, destination, notes, priority } = req.body;

    const batch = await Batch.create({
      exporter: req.user._id,
      product,
      origin,
      destination,
      notes,
      priority,
      status: 'submitted',
      statusHistory: [{
        status: 'submitted',
        changedBy: req.user._id,
        remarks: 'Batch submitted for quality inspection'
      }]
    });

    // Auto-assign to a QA agency (for demo - assign to first available)
    const qaAgency = await User.findOne({ role: 'qa_agency', isActive: true });
    if (qaAgency) {
      batch.assignedQA = qaAgency._id;
      await batch.save();
    }

    await batch.populate('exporter', 'name email organization');
    await batch.populate('assignedQA', 'name email organization');

    res.status(201).json({
      success: true,
      message: 'Batch submitted successfully',
      data: { batch }
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch',
      error: error.message
    });
  }
};

// @desc    Get all batches (filtered by role)
// @route   GET /api/batches
// @access  Private
const getBatches = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'exporter') {
      query.exporter = req.user._id;
    } else if (req.user.role === 'qa_agency') {
      query.assignedQA = req.user._id;
    }
    // Admin sees all

    if (status) query.status = status;
    if (category) query['product.category'] = category;

    const batches = await Batch.find(query)
      .populate('exporter', 'name email organization')
      .populate('assignedQA', 'name email organization')
      .populate('credential', 'credentialId status')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Batch.countDocuments(query);

    res.json({
      success: true,
      data: {
        batches,
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
      message: 'Failed to fetch batches',
      error: error.message
    });
  }
};

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Private
const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('exporter', 'name email organization did')
      .populate('assignedQA', 'name email organization certificationNumber')
      .populate('inspection')
      .populate('credential');

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Check authorization
    if (req.user.role === 'exporter' && batch.exporter._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this batch'
      });
    }

    res.json({
      success: true,
      data: { batch }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch',
      error: error.message
    });
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private (Exporter - owner only)
const updateBatch = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Only allow updates if status is 'submitted'
    if (batch.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update batch after inspection has started'
      });
    }

    // Check ownership
    if (batch.exporter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this batch'
      });
    }

    const { product, origin, destination, notes, priority } = req.body;

    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      { product, origin, destination, notes, priority },
      { new: true, runValidators: true }
    ).populate('exporter', 'name email organization');

    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: { batch: updatedBatch }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update batch',
      error: error.message
    });
  }
};

// @desc    Add document to batch
// @route   POST /api/batches/:id/documents
// @access  Private (Exporter)
const addDocument = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const { name, type, url } = req.body;

    batch.documents.push({ name, type, url, uploadedAt: new Date() });
    await batch.save();

    res.json({
      success: true,
      message: 'Document added successfully',
      data: { batch }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add document',
      error: error.message
    });
  }
};

// @desc    Get batch statistics
// @route   GET /api/batches/stats
// @access  Private
const getBatchStats = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'exporter') {
      query.exporter = req.user._id;
    } else if (req.user.role === 'qa_agency') {
      query.assignedQA = req.user._id;
    }

    const stats = await Batch.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalBatches = await Batch.countDocuments(query);
    const recentBatches = await Batch.countDocuments({
      ...query,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      data: {
        statusBreakdown: stats,
        totalBatches,
        recentBatches
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  addDocument,
  getBatchStats
};