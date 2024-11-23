import { useComputeGraphStore } from "../store/computeGraphStore";
import { useWebSocketStore } from "../store/webSocketStore";
import setUpModel from "../utils/backend/CPU/ModelSetup/setUpModel";
import Data from "../utils/backend/CPU/tools/DataClass";

export function createWebSocketClient(clientId) {
  // 原生websocket
  const ws = new WebSocket('ws://localhost:8080');
  const webSocketStore = useWebSocketStore();
  const client = {
    id: clientId,
    ws: ws,
    connected: false,
    onConnectedChange: null,
    onDataReceived: null,
    onFinalResult: null,
    onError: null,

    init(){
      const computeGraphStore = useComputeGraphStore();
      this.ws.onopen = () => {
        this.connected = true;
        this.onConnectedChange?.(true);
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.onConnectedChange?.(false);
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'data') {
            // 处理数据并返回结果
            // setUpModel(mag.data);
            this.onDataReceived?.({
              receivedData: msg.data,
              // processedResult: 10
            });
            const data = new Data(msg.data, 2, 5000, 2, 2, computeGraphStore.batchSize);
            data.dataSetName = 'classify';
            setUpModel(data, clientId);         
            // this.ws.send(JSON.stringify({
            //     type: 'result',
            //     data: 1
            // }));
        } else if (msg.type === 'finalResult') {
            this.onFinalResult?.(msg.data);
        } else if (msg.type === 'reducedError') {
          computeGraphStore.setAvgError(msg.data);
          console.log('reducedError', msg.data);
        }
      };

      this.ws.onerror = (error) => {
        this.onError?.(error);
      };
    },

    sendStartSignal(){
      if(this.connected){
        this.ws.send(JSON.stringify({ type: 'startProcess' }))
      }
    },

    sendMessageToServer(type, data){
      if(this.connected){
        this.ws.send(JSON.stringify({
          type: type,
          data: data
        }))
      }
    },

    close(){
      this.ws.close();
    }
  };

  client.init();
  webSocketStore.setClients(clientId,client);
  return client;
}