<template>
  <div class="alert-container">
    <transition-group name="alert">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-bubble"
        :class="{ 'is-flashing': alert.flashing }"
        @click="dismissAlert(alert.id)"
      >
        <div class="alert-icon">
          <el-icon :size="24" color="#fff"><Warning /></el-icon>
        </div>
        <div class="alert-content">
          <div class="alert-title">
            新工单提醒
            <el-tag size="small" type="danger" effect="dark" class="alert-tag">
              {{ alert.trashTypeName }}
            </el-tag>
          </div>
          <div class="alert-message">{{ alert.message }}</div>
          <div class="alert-time">{{ formatTime(alert.createdAt) }}</div>
        </div>
        <el-icon class="alert-close" color="#fff"><Close /></el-icon>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Warning, Close } from '@element-plus/icons-vue';

const props = defineProps({
  socket: {
    type: Object,
    default: null,
  },
});

const alerts = ref([]);
let audioContext = null;
let alertIdCounter = 0;

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function playAlertSound() {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (e) {
    console.log('播放提示音失败:', e);
  }
}

function addAlert(order) {
  const id = ++alertIdCounter;
  const alert = {
    id,
    ...order,
    flashing: true,
  };
  alerts.value.unshift(alert);

  playAlertSound();

  setTimeout(() => {
    const idx = alerts.value.findIndex(a => a.id === id);
    if (idx !== -1) {
      alerts.value[idx].flashing = false;
    }
  }, 3000);

  setTimeout(() => {
    dismissAlert(id);
  }, 10000);
}

function dismissAlert(id) {
  const index = alerts.value.findIndex(a => a.id === id);
  if (index !== -1) {
    alerts.value.splice(index, 1);
  }
}

function handleNewWorkOrder(order) {
  addAlert(order);
}

onMounted(() => {
  if (props.socket) {
    props.socket.on('new-work-order', handleNewWorkOrder);
  }
});

onUnmounted(() => {
  if (props.socket) {
    props.socket.off('new-work-order', handleNewWorkOrder);
  }
});

defineExpose({ addAlert });
</script>

<style scoped>
.alert-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 380px;
}

.alert-bubble {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 4px 20px rgba(238, 90, 36, 0.4);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.alert-bubble.is-flashing {
  animation: flashAlert 0.6s ease-in-out infinite alternate;
}

@keyframes flashAlert {
  0% {
    box-shadow: 0 4px 20px rgba(238, 90, 36, 0.4);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 6px 30px rgba(238, 90, 36, 0.8);
    transform: scale(1.02);
  }
}

.alert-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: translateX(-100%);
}

.alert-bubble.is-flashing::before {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.alert-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-tag {
  font-size: 11px;
}

.alert-message {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 4px;
  opacity: 0.95;
}

.alert-time {
  font-size: 11px;
  opacity: 0.8;
}

.alert-close {
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.alert-bubble:hover .alert-close {
  opacity: 1;
}

.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s ease;
}

.alert-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(100%);
  height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: -12px;
}
</style>
