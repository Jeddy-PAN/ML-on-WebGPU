import { WebSocket, WebSocketServer } from 'ws';
import { handleDataSet_Server } from './utils/handleDataSet_Server';

interface ServerMessage {
  type: string;
  data: any;
}

const wss = new WebSocketServer({ port: 8080 });
let clients: WebSocket[] = [];
let results: number[] = [];

wss.on('connection', (ws: WebSocket) => {
  clients.push(ws);
  console.log('Server: New client connected. Total clients:', clients.length);
  
  // server received message
  ws.on('message', (message: string) => {
    const msg: ServerMessage = JSON.parse(message.toString());
    if(msg.type === 'result'){
      results.push(msg.data);
      console.log(`Server received result: ${msg.data}`);

      // server received all results
      if (results.length === 2) {
        const finalResult = results.reduce((acc, curr) => acc + curr, 0);
        console.log('Final combined result:', finalResult);
        
        // send the final result to clients
        clients.forEach(client => {
          client.send(JSON.stringify({
            type: 'finalResult',
            data: finalResult
          }));
        });
        
        // reset results
        results = [];
      }
    } else if(msg.type === 'startProcess'){
      handleDataSet_Server(clients);
    }    
  });

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log(`Server: Client closed. Remaining clients: ${clients.length}`);
  });
});

console.log('Server runs on port 8080');