<template>
  <div class="trash-bin-card" :class="{ 'is-full': bin.isFull }">
    <div class="bin-icon">
      <svg
        viewBox="0 0 64 80"
        xmlns="http://www.w3.org/2000/svg"
        :class="{ 'full-icon': bin.isFull }"
      >
        <defs>
          <linearGradient :id="'fill-gradient-' + bin._id" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" :style="{ stopColor: fillColor, stopOpacity: 1 }" />
            <stop offset="100%" :style="{ stopColor: fillColorLight, stopOpacity: 1 }" />
          </linearGradient>
        </defs>
        <path
          d="M12 76C12 78.2 13.8 80 16 80H48C50.2 80 52 78.2 52 76V20H12V76Z"
          :fill="bin.isFull ? '#ff6b6b' : '#e0e0e0'"
          stroke="#999"
          stroke-width="2"
        />
        <path
          :d="fillPath"
          :fill="'url(#fill-gradient-' + bin._id + ')'"
        />
        <path
          d="M10 16H54C55.1 16 56 15.1 56 14V10C56 8.9 55.1 8 54 8H10C8.9 8 8 8.9 8 10V14C8 15.1 8.9 16 10 16Z"
          :fill="bin.isFull ? '#ff5252' : '#bdbdbd'"
        />
        <path
          d="M24 4H40V8H24V4Z"
          :fill="bin.isFull ? '#ff5252' : '#bdbdbd'"
        />
        <line x1="20" y1="28" x2="20" y2="68" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
        <line x1="32" y1="28" x2="32" y2="68" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
        <line x1="44" y1="28" x2="44" y2="68" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
      </svg>
      <el-badge
        v-if="bin.isFull"
        class="full-badge"
        value="满"
        :max="99"
        type="danger"
      />
    </div>
    <div class="bin-info">
      <div class="bin-type">
        <span class="type-label" :style="{ backgroundColor: typeColor }">
          {{ typeName }}
        </span>
      </div>
      <div class="bin-location">{{ bin.locationName }}</div>
      <div class="fill-level">
        <el-progress
          :percentage="bin.fillLevel"
          :color="progressColor"
          :stroke-width="8"
        />
      </div>
      <div class="fill-text">
        满载率: <strong :class="{ 'full-text': bin.isFull }">{{ bin.fillLevel }}%</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  bin: {
    type: Object,
    required: true,
  },
});

const typeMap = {
  kitchen: { name: '厨余垃圾', color: '#67c23a' },
  recyclable: { name: '可回收物', color: '#409eff' },
  harmful: { name: '有害垃圾', color: '#f56c6c' },
  other: { name: '其他垃圾', color: '#909399' },
};

const typeName = computed(() => typeMap[props.bin.type]?.name || '未知');
const typeColor = computed(() => typeMap[props.bin.type]?.color || '#909399');

const fillColor = computed(() => {
  if (props.bin.isFull) return '#ff4444';
  return typeMap[props.bin.type]?.color || '#909399';
});

const fillColorLight = computed(() => {
  if (props.bin.isFull) return '#ff8888';
  const base = typeMap[props.bin.type]?.color || '#909399';
  return base + '80';
});

const progressColor = computed(() => {
  if (props.bin.isFull) return '#f56c6c';
  if (props.bin.fillLevel >= 80) return '#e6a23c';
  return typeMap[props.bin.type]?.color || '#909399';
});

const fillPath = computed(() => {
  const level = props.bin.fillLevel;
  const height = (level / 100) * 56;
  const y = 76 - height;
  return `M12 ${y} L12 76 C12 78.2 13.8 80 16 80 H48 C50.2 80 52 78.2 52 76 L52 ${y} Z`;
});
</script>

<style scoped>
.trash-bin-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 2px solid transparent;
}

.trash-bin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.trash-bin-card.is-full {
  border-color: #f56c6c;
  background: #fff5f5;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 2px 12px rgba(245, 108, 108, 0.2);
  }
  50% {
    box-shadow: 0 2px 20px rgba(245, 108, 108, 0.4);
  }
}

.bin-icon {
  position: relative;
  margin-bottom: 16px;
}

.bin-icon svg {
  width: 80px;
  height: 100px;
}

.full-badge {
  position: absolute;
  top: -8px;
  right: -8px;
}

.bin-info {
  width: 100%;
  text-align: center;
}

.bin-type {
  margin-bottom: 8px;
}

.type-label {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  color: white;
  font-size: 12px;
  font-weight: 500;
}

.bin-location {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.fill-level {
  margin-bottom: 8px;
}

.fill-text {
  font-size: 14px;
  color: #606266;
}

.fill-text strong {
  font-size: 16px;
  color: #303133;
}

.fill-text .full-text {
  color: #f56c6c;
}
</style>
