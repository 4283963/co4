const TrashBin = require('../models/TrashBin');
const { createWorkOrder } = require('../controllers/workOrderController');

function getRandomIncrement() {
  return Math.floor(Math.random() * 15) + 1;
}

const AUTO_DISPATCH_TYPES = ['kitchen', 'recyclable'];

async function updateFillLevels(io) {
  try {
    const bins = await TrashBin.find();
    const updatedBins = [];
    const newlyFullBins = [];

    for (const bin of bins) {
      const wasFull = bin.isFull;
      if (bin.fillLevel < 100) {
        const increment = getRandomIncrement();
        bin.fillLevel = Math.min(100, bin.fillLevel + increment);
        await bin.save();
        updatedBins.push(bin);

        if (!wasFull && bin.isFull && AUTO_DISPATCH_TYPES.includes(bin.type)) {
          newlyFullBins.push(bin);
        }
      }
    }

    if (updatedBins.length > 0 && io) {
      io.emit('bins-updated', updatedBins);
    }

    for (const bin of newlyFullBins) {
      await createWorkOrder(bin, io);
    }

    return updatedBins;
  } catch (error) {
    console.error('更新满载率时出错:', error.message);
  }
}

function startFillLevelScheduler(io) {
  console.log('定时任务已启动：每 5 秒更新垃圾桶满载率');
  setInterval(() => {
    updateFillLevels(io);
  }, 5000);
}

module.exports = { startFillLevelScheduler, updateFillLevels };
