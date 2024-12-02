import { useComputeGraphStore } from "../store/computeGraphStore";
import { useWebSocketStore } from "../store/webSocketStore";
import setUpModel from "../utils/backend/CPU/ModelSetup/setUpModel";
import Data from "../utils/backend/CPU/tools/DataClass";

export function createWebSocketClient() {
  // create the connection to the server
  const ws = new WebSocket('ws://localhost:8080');

  // get pinia stores
  const webSocketStore = useWebSocketStore();
  const computeGraphStore = useComputeGraphStore();

  // this client (one node in the distributed system)
  const client = {
    ws: ws,
    connected: false,
    onConnectedChange: null,
    onDataReceived: null,
    onFinalResult: null,
    onError: null,

    // constructor
    init(){
      this.ws.onopen = () => {
        this.connected = true;
        this.onConnectedChange?.(true);
      };

      this.ws.onclose = () => {
        this.connected = false;
        // clear ws store when closed
        webSocketStore.setClientID(null);
        webSocketStore.clientList.clear();
        this.onConnectedChange?.(false);
      };

      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        // main operation
        this.operation(msg);
      };

      this.ws.onerror = (error) => {
        webSocketStore.setClientID(null);
        webSocketStore.clientList.clear();
        this.onError?.(error);
      };
    },

    // send start signal to the server (start training)
    sendStartSignal(){
      if(this.connected){
        this.ws.send(JSON.stringify({ type: 'startProcess' }))
      }
    },

    // send message to the server
    sendMessageToServer(type, data){
      if(this.connected){
        this.ws.send(JSON.stringify({
          type: type,
          data: data
        }))
      }
    },

    // main operation when receiving message from the server
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