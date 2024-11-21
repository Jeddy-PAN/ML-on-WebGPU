import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { handleMessageFromWorker } from './utils/handleMessageFromWorker.js';
import { handleMessageFromDao } from './utils/handleMessageFromDao.js';

const wss = new WebSocketServer({ port: 8080 });

const clientsByRole = {
  worker: new Map(),
  dao: new Map()
};

let results = [];

wss.on('connection', (ws, req) => {
  const role = new URL(req.url, 'ws://localhost').searchParams.get('role');

  if (!role || !clientsByRole.hasOwnProperty(role)) {
    console.log('Invalid role, closing connection');
    ws.close();
    return;
  }

  const clientId = uuidv4();
  clientsByRole[role].set(clientId, ws);

  console.log(`Server: New ${role} client connected. ID: ${clientId}`);
  
  // server received message
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    switch(role){
      case 'worker':
        handleMessageFromWorker(clientsByRole, msg);
        break;
      case 'dao':
        handleMessageFromDao(clientsByRole, msg);
        break;
    }
    // if(msg.type === 'result'){
    //   results.push(msg.data);
    //   console.log(`Server received result: ${msg.data}`);

    //   // server received all results
    //   if (results.length === 2) {
    //     // reduce here
    //     const finalResult = results.reduce((acc, curr) => acc + curr, 0);
    //     console.log('Final combined result:', finalResult);
        
    //     // send the final result to clients
    //     clients.forEach(client => {
    //         client.send(JSON.stringify({
    //             type: 'finalResult',
    //             data: finalResult
    //         }));
    //     });
        
    //     // reset results
    //     results = [];
    // }
    // }else if(msg.type === 'startProcess'){
    //   // send the data to clients
    //   handleDataSet_Server(clients);
    //   // handleArrayData(clients, data);   
    // }    
  });


  ws.on('close', () => {
    clientsByRole[role].delete(clientId);
    console.log(`${role} client ${clientId} disconnected`);
  });
});

console.log('Server runs on port 8080')