const WorkOrder = require('../models/WorkOrder');

function generateOrderId() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO${dateStr}${random}`;
}

const typeMap = {
  kitchen: '厨余垃圾',
  recyclable: '可回收物',
  harmful: '有害垃圾',
  other: '其他垃圾',
};

async function createWorkOrder(bin, io) {
  try {
    const existingOrder = await WorkOrder.findOne({
      trashBinId: bin._id,
      status: { $in: ['pending', 'processing'] },
    });

    if (existingOrder) {
      return null;
    }

    const order = new WorkOrder({
      orderId: generateOrderId(),
      locationId: bin.locationId,
      locationName: bin.locationName,
      trashType: bin.type,
      trashBinId: bin._id,
      status: 'pending',
      assignedTo: '清运组',
    });

    await order.save();

    const orderWithInfo = order.toObject();
    orderWithInfo.trashTypeName = typeMap[bin.type] || bin.type;
    orderWithInfo.message = `检测到${bin.locationName}${typeMap[bin.type]}已满，已自动派单给清运员`;

    if (io) {
      io.emit('new-work-order', orderWithInfo);
    }

    console.log(`自动派单: ${order.orderId} - ${bin.locationName} ${typeMap[bin.type]}`);
    return orderWithInfo;
  } catch (error) {
    console.error('创建工单失败:', error.message);
    return null;
  }
}

exports.getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const orders = await WorkOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const ordersWithInfo = orders.map(order => {
      const obj = order.toObject();
      obj.trashTypeName = typeMap[order.trashType] || order.trashType;
      return obj;
    });

    res.json(ordersWithInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await WorkOrder.findById(id);
    if (!order) {
      return res.status(404).json({ error: '工单不存在' });
    }
    const obj = order.toObject();
    obj.trashTypeName = typeMap[order.trashType] || order.trashType;
    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    const order = await WorkOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: '工单不存在' });
    }
    const obj = order.toObject();
    obj.trashTypeName = typeMap[order.trashType] || order.trashType;

    const io = req.app.get('io');
    if (io) {
      io.emit('work-order-updated', obj);
    }

    res.json(obj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createWorkOrder = createWorkOrder;
