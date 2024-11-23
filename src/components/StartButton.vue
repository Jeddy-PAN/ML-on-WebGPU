<template>
  <button @click="startTraining()">StartTraining</button>
</template>

<script setup>
  import { getCSV_classify } from '../utils/backend/CPU/ModelSetup/setUpData.ts';
  // import { useComputeGraphStore } from '../store/computeGraphStore.js';
  // import { ref } from 'vue';

  // const result = ref(0.0);

  const startTraining = () => {
    getCSV_classify()
  }
</script>

<style scoped>
  button{
    margin-top: 50px;
  }
</style>