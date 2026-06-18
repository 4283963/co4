const TrashBin = require('../models/TrashBin');

const initialBins = [
  { locationId: 'loc-1', locationName: '1号投放点', type: 'kitchen' },
  { locationId: 'loc-1', locationName: '1号投放点', type: 'recyclable' },
  { locationId: 'loc-1', locationName: '1号投放点', type: 'harmful' },
  { locationId: 'loc-1', locationName: '1号投放点', type: 'other' },
  { locationId: 'loc-2', locationName: '2号投放点', type: 'kitchen' },
  { locationId: 'loc-2', locationName: '2号投放点', type: 'recyclable' },
  { locationId: 'loc-2', locationName: '2号投放点', type: 'harmful' },
  { locationId: 'loc-2', locationName: '2号投放点', type: 'other' },
  { locationId: 'loc-3', locationName: '3号投放点', type: 'kitchen' },
  { locationId: 'loc-3', locationName: '3号投放点', type: 'recyclable' },
  { locationId: 'loc-3', locationName: '3号投放点', type: 'harmful' },
  { locationId: 'loc-3', locationName: '3号投放点', type: 'other' },
  { locationId: 'loc-4', locationName: '4号投放点', type: 'kitchen' },
  { locationId: 'loc-4', locationName: '4号投放点', type: 'recyclable' },
  { locationId: 'loc-4', locationName: '4号投放点', type: 'harmful' },
  { locationId: 'loc-4', locationName: '4号投放点', type: 'other' },
  { locationId: 'loc-5', locationName: '5号投放点', type: 'kitchen' },
  { locationId: 'loc-5', locationName: '5号投放点', type: 'recyclable' },
  { locationId: 'loc-5', locationName: '5号投放点', type: 'harmful' },
  { locationId: 'loc-5', locationName: '5号投放点', type: 'other' },
  { locationId: 'loc-6', locationName: '6号投放点', type: 'kitchen' },
  { locationId: 'loc-6', locationName: '6号投放点', type: 'recyclable' },
  { locationId: 'loc-6', locationName: '6号投放点', type: 'harmful' },
  { locationId: 'loc-6', locationName: '6号投放点', type: 'other' },
];

async function initializeBins() {
  const count = await TrashBin.countDocuments();
  if (count === 0) {
    await TrashBin.insertMany(initialBins);
    console.log('初始垃圾桶数据已创建');
  }
}

exports.getAllBins = async (req, res) => {
  try {
    const bins = await TrashBin.find().sort({ locationId: 1, type: 1 });
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBinsByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const bins = await TrashBin.find({ locationId }).sort({ type: 1 });
    res.json(bins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFillLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { fillLevel } = req.body;
    const bin = await TrashBin.findByIdAndUpdate(
      id,
      { fillLevel },
      { new: true, runValidators: true }
    );
    if (!bin) {
      return res.status(404).json({ error: '垃圾桶不存在' });
    }
    res.json(bin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.emptyBin = async (req, res) => {
  try {
    const { id } = req.params;
    const bin = await TrashBin.findByIdAndUpdate(
      id,
      { fillLevel: 0, isFull: false },
      { new: true }
    );
    if (!bin) {
      return res.status(404).json({ error: '垃圾桶不存在' });
    }
    const io = req.app.get('io');
    if (io) {
      io.emit('bins-updated', [bin]);
    }
    res.json(bin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.initializeBins = initializeBins;
