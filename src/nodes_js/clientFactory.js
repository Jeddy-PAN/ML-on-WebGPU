import { useComputeGraphStore } from "../store/computeGraphStore";
import setUpModel from "../utils/backend/CPU/ModelSetup/setUpModel";
import Data from "../utils/backend/CPU/tools/DataClass";

export function createWebSocketClient(clientId) {
  // 原生websocket
  const ws = new WebSocket('ws://localhost:8080');

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
            const data = new Data(msg.data, 2, 5000, 2, 2, computeGraphStore.batchSize);
            data.dataSetName = 'classify';
            setUpModel(data);
            this.onDataReceived?.({
                receivedData: msg.data,
                processedResult: 10
            });
            
            this.ws.send(JSON.stringify({
                type: 'result',
                data: 1
            }));
        } else if (msg.type === 'finalResult') {
            this.onFinalResult?.(msg.data);
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

    close(){
      this.ws.close();
    }
  };

  client.init();
  return client;
}