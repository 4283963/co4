<template>
  <div class="dashboard">
    <el-header class="header">
      <div class="header-content">
        <div class="logo-section">
          <el-icon class="logo-icon"><TrendCharts /></el-icon>
          <h1 class="title">智能垃圾桶管理系统</h1>
        </div>
        <div class="status-section">
          <el-tag :type="connectionStatus ? 'success' : 'danger'" class="connection-tag">
            <span class="status-dot" :class="{ 'online': connectionStatus }"></span>
            {{ connectionStatus ? '实时连接中' : '连接断开' }}
          </el-tag>
          <el-tag type="info" class="count-tag">
            共 {{ totalBins }} 个垃圾桶
          </el-tag>
          <el-tag type="danger" class="count-tag" v-if="fullBinsCount > 0">
            {{ fullBinsCount }} 个已满
          </el-tag>
        </div>
      </div>
    </el-header>

    <el-main class="main-content">
      <div class="filter-bar">
        <el-select v-model="selectedType" placeholder="选择垃圾类型" clearable style="width: 160px">
          <el-option label="全部类型" value="" />
          <el-option label="厨余垃圾" value="kitchen" />
          <el-option label="可回收物" value="recyclable" />
          <el-option label="有害垃圾" value="harmful" />
          <el-option label="其他垃圾" value="other" />
        </el-select>
        <el-select v-model="selectedLocation" placeholder="选择投放点" clearable style="width: 160px">
          <el-option label="全部投放点" value="" />
          <el-option
            v-for="loc in locations"
            :key="loc.id"
            :label="loc.name"
            :value="loc.id"
          />
        </el-select>
        <el-switch
          v-model="showFullOnly"
          active-text="只看满桶"
          style="margin-left: 16px"
        />
      </div>

      <div class="bins-grid" v-loading="loading">
        <TrashBin
          v-for="bin in filteredBins"
          :key="bin._id"
          :bin="bin"
        />
      </div>

      <el-empty v-if="!loading && filteredBins.length === 0" description="暂无垃圾桶数据" />
    </el-main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import axios from 'axios';
import TrashBin from './components/TrashBin.vue';

const bins = ref([]);
const loading = ref(true);
const connectionStatus = ref(false);
const selectedType = ref('');
const selectedLocation = ref('');
const showFullOnly = ref(false);

let socket = null;

const totalBins = computed(() => bins.value.length);
const fullBinsCount = computed(() => bins.value.filter(b => b.isFull).length);

const locations = computed(() => {
  const locMap = new Map();
  bins.value.forEach(bin => {
    if (!locMap.has(bin.locationId)) {
      locMap.set(bin.locationId, { id: bin.locationId, name: bin.locationName });
    }
  });
  return Array.from(locMap.values());
});

const filteredBins = computed(() => {
  let result = bins.value;

  if (selectedType.value) {
    result = result.filter(b => b.type === selectedType.value);
  }

  if (selectedLocation.value) {
    result = result.filter(b => b.locationId === selectedLocation.value);
  }

  if (showFullOnly.value) {
    result = result.filter(b => b.isFull);
  }

  return result;
});

async function fetchBins() {
  try {
    const response = await axios.get('/api/bins');
    bins.value = response.data;
  } catch (error) {
    console.error('获取垃圾桶数据失败:', error);
  } finally {
    loading.value = false;
  }
}

function initSocket() {
  socket = io('http://localhost:3000', {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('已连接到服务器');
    connectionStatus.value = true;
  });

  socket.on('disconnect', () => {
    console.log('与服务器断开连接');
    connectionStatus.value = false;
  });

  socket.on('bins-updated', (updatedBins) => {
    updatedBins.forEach(updatedBin => {
      const index = bins.value.findIndex(b => b._id === updatedBin._id);
      if (index !== -1) {
        bins.value[index] = updatedBin;
      }
    });
  });
}

onMounted(() => {
  fetchBins();
  initSocket();
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
  }
});
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0;
  height: auto !important;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: white;
}

.status-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

.connection-tag {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #909399;
  display: inline-block;
}

.status-dot.online {
  background-color: #67c23a;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.count-tag {
  font-size: 13px;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 24px 30px;
}

.filter-bar {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.bins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    padding: 16px;
  }

  .title {
    font-size: 20px;
  }

  .main-content {
    padding: 16px;
  }

  .bins-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
}
</style>
