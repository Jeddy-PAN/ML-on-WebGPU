import { startTraining } from "./workerApi";
export function handleMessageFromServer(ws, msg){
  switch(msg.type){
    case 'data':
      startTraining(msg.data);
      ws.send(JSON.stringify({
          type: 'result',
          data: 10
      }));
      break;
  }
}