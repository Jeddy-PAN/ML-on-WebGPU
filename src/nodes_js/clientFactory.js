import { useComputeGraphStore } from "../store/computeGraphStore";
import { useWebSocketStore } from "../store/webSocketStore";
import setUpModel from "../utils/backend/CPU/ModelSetup/setUpModel";
import Data from "../utils/backend/CPU/tools/DataClass";

export function createWebSocketClient() {
  // 原生websocket
  const ws = new WebSocket('ws://localhost:8080');
  const webSocketStore = useWebSocketStore();
  const computeGraphStore = useComputeGraphStore();
  const client = {
    ws: ws,
    connected: false,
    onConnectedChange: null,
    onDataReceived: null,
    onFinalResult: null,
    onError: null,

    init(){
      this.ws.onopen = () => {
        this.connected = true;
        this.onConnectedChange?.(true);
      };

      this.ws.onclose = () => {
        this.connected = false;
        webSocketStore.setClientID(null);
        webSocketStore.clientList.clear();
        this.onConnectedChange?.(false);
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        this.operation(msg);
      };

      this.ws.onerror = (error) => {
        webSocketStore.setClientID(null);
        webSocketStore.clientList.clear();
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

    operation(msg){
      if (msg.type === 'data') {
        // 处理数据并返回结果
        this.onDataReceived?.({
          receivedData: msg.data,
          // processedResult: 10
        });
        const data = new Data(msg.data, 2, 5000, 2, 2, computeGraphStore.batchSize);
        data.dataSetName = 'classify';
        setUpModel(data, webSocketStore.getClientID());         
        // this.ws.send(JSON.stringify({
        //     type: 'result',
        //     data: 1
        // }));
      } else if (msg.type === 'finalResult') {
          this.onFinalResult?.(msg.data);
      } else if (msg.type === 'reducedError') {
        computeGraphStore.setAvgError(msg.data);
        console.log('reducedError', msg.data);
      } else if (msg.type === 'reducedGradient') {
        console.log('reduceGranient', msg.data);
      } else if (msg.type === 'clientList'){
        const clientList = msg.data;
        webSocketStore.clientList.clear();
        clientList.forEach(cli => {
          webSocketStore.setClients(cli.id, cli);
        });
      } else if (msg.type === 'register'){
        webSocketStore.setClientID(msg.data);
      }
    },

    close(){
      this.ws.close();
    }
  };

  client.init();
  webSocketStore.setWS(client);
  return client;
}