<template>
  <div class="data-processor">
    <h1>Data Processing Demo</h1>
    
    <div class="status-panel">
      <div :class="['status-indicator', { active: client1Connected }]">
        Client 1: {{ client1Connected ? 'Connected' : 'Disconnected' }}
      </div>
      <div :class="['status-indicator', { active: client2Connected }]">
        Client 2: {{ client2Connected ? 'Connected' : 'Disconnected' }}
      </div>
    </div>

    <button 
      @click="startProcessing" 
      :disabled="!client1Connected || !client2Connected"
      class="process-btn"
    >
      Start Processing
    </button>

    <div class="results-panel" v-if="finalResult !== null">
      <h2>Final Result:</h2>
      <div class="result-value">{{ finalResult }}</div>
    </div>

    <div class="results-panel" v-if="clientResults.length > 0">
      <h2>Individual Results:</h2>
      <div v-for="(result, index) in clientResults" :key="index">
        Client {{ index + 1 }}: {{ result }}
      </div>
    </div>

    <div class="log-panel">
      <h3>Processing Log:</h3>
      <div class="log-content">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
  import { createWebSocketClient } from '../nodes_js/clientFactory';
  import { useWebSocketStore } from '../store/webSocketStore';
  import { storeToRefs } from 'pinia';

  // Definition
  const client1Connected = ref(false);  // connected status 1
  const client2Connected = ref(false);  // connected status 2
  const finalResult = ref(null);        // final result
  const clientResults = ref([]);        // individual result from each client
  const logs = ref([]);                 // logs

  // instance of this client
  let client1 = null;

  // pinia store
  const webSocketStore = useWebSocketStore();
  const { clientID, clientList } = storeToRefs(webSocketStore);

  // listen the change of store
  watch (
    () => clientID,
    (newID, oldID) => {
      console.log('NodeID', newID.value);
    },
    { immediate: true }
  )

  watch (
    () => clientList,
    (newList, oldList) => {
      if(newList.value.size === 2){
        client1Connected.value = true;
        client2Connected.value = true;
        console.log('clientList', newList.value);
      }
    },
    { 
      deep: true,
      immediate: true
    }
  )

  // log function
  const addLog = (message) => {
    logs.value.push(`${new Date().toLocaleTimeString()}: ${message}`);
  };

  // initialize this client
  const setupClient1 = () => {
    client1 = createWebSocketClient();
    
    client1.onConnectedChange = (connected) => {
      // client1Connected.value = connected;
      addLog(`Client ${connected ? 'connected' : 'disconnected'}`);
    };

    client1.onDataReceived = ({ receivedData, processedResult }) => {
      addLog(`Client received data chunk of ${receivedData.length} items`);
      addLog(`Client processed result: ${processedResult}`);
      clientResults.value[0] = processedResult;
    };

    client1.onFinalResult = (result) => {
      finalResult.value = result;
      addLog(`Received final result: ${result}`);
    };

    client1.onError = (error) => {
      addLog(`Client error: ${error.message}`);
    };
  };

  // inform the server to start training, request the dataset from server
  const startProcessing = () => {
    finalResult.value = null;
    clientResults.value = [];
    addLog('Starting data processing...');
    client1.sendStartSignal();
  };

  onMounted(() => {
    // if this client does not exist, create this client.
    if(!webSocketStore.getWS()){
      setupClient1();
    }
  });

  onBeforeUnmount(() => {
    // close the client and delete it in the store
    if(client1){
      client1.close();
      webSocketStore.setWS(null);
    }
  });
</script>

<style scoped>
  .data-processor {
    max-width: 800px;
    margin: 0;
    padding: 20px;
  }

  .status-panel {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    flex-flow: column;
  }

  .status-indicator {
    padding: 10px 20px;
    border-radius: 4px;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
  }

  .status-indicator.active {
    background-color: #4CAF50;
    color: white;
  }

  .process-btn {
    padding: 12px 24px;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }

  .process-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .results-panel {
    margin-top: 20px;
    padding: 20px;
    background-color: #f8f8f8;
    border-radius: 4px;
  }

  .result-value {
    font-size: 24px;
    font-weight: bold;
    color: #2196F3;
  }

  .log-panel {
    margin-top: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 10px;
  }

  .log-content {
    max-height: 200px;
    overflow-y: auto;
  }

  .log-entry {
    padding: 5px;
    border-bottom: 1px solid #eee;
    font-family: monospace;
  }
</style>