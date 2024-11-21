import { divideData } from "./daoApi";
export function handleMessageFromServer(ws, msg){
  switch(msg.type){
    case 'getData':
      const chunks = divideData(msg.data);
      ws.send(JSON.stringify({
        type: 'data',
        data: chunks
      }))
      break;
  }
}