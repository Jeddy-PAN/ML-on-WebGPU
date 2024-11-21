import { handleMessageFromServer } from "./utils/handleMessageFromServer_Dao";
export function createDataAccess() {
  // 原生websocket
  const ws = new WebSocket('ws://localhost:8080?role=dao');

  const client = {
    ws: ws,
    connected: false,
    onConnectedChange: null,
    onDataReceived: null,
    onFinalResult: null,
    onError: null,

    init(){
      // const computeGraphStore = useComputeGraphStore();
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
        handleMessageFromServer(this.ws, msg);
        // if (msg.type === 'getData') {
        //     // const data = new Data(msg.data, 2, 5000, 2, 2, computeGraphStore.batchSize);
        //     data.dataSetName = 'classify';
        //     setUpModel(data);
        //     this.onDataReceived?.({
        //         receivedData: msg.data,
        //         processedResult: 10
        //     });
            
        //     this.ws.send(JSON.stringify({
        //         type: 'result',
        //         data: 1
        //     }));
        // }
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