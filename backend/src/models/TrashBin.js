const mongoose = require('mongoose');

const trashBinSchema = new mongoose.Schema({
  locationId: {
    type: String,
    required: true,
  },
  locationName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['kitchen', 'recyclable', 'harmful', 'other'],
  },
  fillLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isFull: {
    type: Boolean,
    default: false,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

trashBinSchema.pre('save', function (next) {
  this.isFull = this.fillLevel >= 100;
  if (this.fillLevel > 100) this.fillLevel = 100;
  if (this.fillLevel < 0) this.fillLevel = 0;
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('TrashBin', trashBinSchema);
