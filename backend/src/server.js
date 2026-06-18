require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const trashBinRoutes = require('./routes/trashBinRoutes');
const { startFillLevelScheduler } = require('./middleware/scheduler');
const { initializeBins } = require('./controllers/trashBinController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/bins', trashBinRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '智能垃圾桶管理系统运行正常' });
});

io.on('connection', (socket) => {
  console.log('客户端已连接:', socket.id);

  socket.on('disconnect', () => {
    console.log('客户端已断开:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trash-bin-db';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('已连接到 MongoDB');
    await initializeBins();
    startFillLevelScheduler(io);
    server.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`健康检查: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('MongoDB 连接失败:', error.message);
  });

module.exports = { app, server, io };
