const mongoose = require('mongoose');

const workOrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  locationId: {
    type: String,
    required: true,
  },
  locationName: {
    type: String,
    required: true,
  },
  trashType: {
    type: String,
    required: true,
    enum: ['kitchen', 'recyclable', 'harmful', 'other'],
  },
  trashBinId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrashBin',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  },
  assignedTo: {
    type: String,
    default: '清运组',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
