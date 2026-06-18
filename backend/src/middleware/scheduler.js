const TrashBin = require('../models/TrashBin');

function getRandomIncrement = () => {
  return Math.floor(Math.random() * 15) + 1;
};

async function updateFillLevels(io) {
  try {
    const bins = await TrashBin.find();
    const updatedBins = [];

    for (const bin of bins) {
      if (bin.fillLevel < 100) {
        const increment = getRandomIncrement();
        bin.fillLevel = Math.min(100, bin.fillLevel + increment);
        await bin.save();
        updatedBins.push(bin);
      }
    }

    if (updatedBins.length > 0 && io) {
      io.emit('bins-updated', updatedBins);
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
