import { connected } from "process";
import setUpModel from "../utils/backend/CPU/ModelSetup/setUpModel";

interface ClientMessage {
  type: string;
  data: any;
}

// interface ReceivedDataEvent {
//   receivedData: any;
//   processedResult: any;
// }

// interface WebSocketClient {
//   id: string;
//   ws: WebSocket;
//   connected: boolean;
//   onConnectedChange: (connected: boolean) => void;
//   onDataReceived: (event: ReceivedDataEvent) => void;
//   onFinalResult: (result: any) => void;
//   onError: (error: Event) => void;
//   init: () => void;
//   sendStartSignal: () => void;
//   close: () => void;
// }

export function createWebSocketClient(clientId : Number)  {
  const ws = new WebSocket('ws://localhost:8080');

  const client = {
    id: clientId,
    ws: ws,
    connected: false,
    onConnectedChange: null as ((connected: boolean) => void) | null,
    onDataReceived: null as ((event: { receivedData: any }) => void) | null,
    onFinalResult: null as ((result: any) => void) | null,
    onError: null as ((error: Event) => void) | null,

    init() {
      this.ws.onopen = () => {
        this.connected = true;
        this.onConnectedChange?.(true);
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.onConnectedChange?.(false);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        const msg: ClientMessage = JSON.parse(event.data);
        if (msg.type === 'data') {
          setUpModel(msg.data);
          this.onDataReceived?.({
            receivedData: msg.data
          });
        } else if (msg.type === 'finalResult') {
          this.onFinalResult?.(msg.data);
        }
      };

      this.ws.onerror = (error: Event) => {
        this.onError?.(error);
      };
    },

    sendStartSignal() {
      if(this.connected) {
        this.ws.send(JSON.stringify({ type: 'startProcess' }));
      }
    },

    close() {
      this.ws.close();
    }
  };

  client.init();
  return client;
}