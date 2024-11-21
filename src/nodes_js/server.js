import { WebSocketServer } from 'ws';
import { handleDataSet_Server, handleArrayData } from './utils/handleDataSet_Server.js';

const wss = new WebSocketServer({ port: 8080 });
let clients = [];
let results = [];

const data = Array.from({length: 100}, (_, i) => i + 1);

wss.on('connection', (ws) => {
  clients.push(ws);
  console.log('Server: New client connected. Total clients:', clients.length);
  
  // server received message
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if(msg.type === 'result'){
      results.push(msg.data);
      console.log(`Server received result: ${msg.data}`);

      // server received all results
      if (results.length === 2) {
        // reduce here
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
    }else if(msg.type === 'startProcess'){
      // send the data to clients
      handleDataSet_Server(clients);
      // handleArrayData(clients, data);   
    }    
  });


  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log(`Server: Client closed. Remaining clients: ${clients.length}`);
  })
});

console.log('Server runs on port 8080')