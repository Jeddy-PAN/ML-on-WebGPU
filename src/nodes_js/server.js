import { WebSocketServer } from 'ws';
import { handleDataSet_Server, reduceResult } from './utils/handleDataSet_Server.js';

// create the websocket server
const wss = new WebSocketServer({ port: 8080 });

const clients = new Map();  // all connected clients 
let results = [];           // all results from clients
let arrayError = [];        // all errors from clients
let arrayGradient = [];     // all gradients from clients

// when one client connected to the server
wss.on('connection', (ws) => {
  // generate the unique ID of each client and send back the ID to the client
  const clientID = generateUniqueId();
  sendMessage(ws, 'register', clientID);
  console.log('connected: ', clientID);

  // record this client into clients MAP
  clients.set(clientID, {
    id: clientID,
    ws: ws,
    connectTime: new Date()
  })
  console.log('Server: New client connected. Total clients:', clients.size);

  // broadcast the clientList to all connected clients
  broadcastClientList();
  
  // server received message
  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    operation(msg);
  });

  ws.on('close', () => {
    clients.delete(clientID);
    broadcastClientList();
  })
});

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

function broadcastMessage(type, data) {
  const message = {
      type: type,
      data: data
  };

  clients.forEach(client => {
      client.ws.send(JSON.stringify(message));
  });
}

function broadcastClientList(){
  const clientList = Array.from(clients.values()).map(client => ({
    id: client.id,
    connectTime: client.connectTime
  }));
  broadcastMessage('clientList', clientList);
}

function sendMessage(ws, type, data){
  const message = {
    type: type,
    data: data
  }
  ws.send(JSON.stringify(message));
}

function sendClientList(ws){
  const clientList = Array.from(clients.values()).map(client => ({
    id: client.id,
    connectTime: client.connectTime
  }));
  sendMessage(ws, 'clientList', clientList);
}

function sendSourceData(data){
  let index = 0;
  clients.forEach(client => {
    client.ws.send(JSON.stringify({
      type: 'data',
      data: data[index],
      index: index
    }))
    index++;
  })

}

// main operation according to the msg from clients
function operation(msg){
  if(msg.type === 'result') {
    results.push(msg.data);
    console.log(`Server received result: ${msg.data}`);

    // server received all results
    if (results.length === 2) {
      // reduce here
      const finalResult = results.reduce((acc, curr) => acc + curr, 0);
      console.log('Final combined result:', finalResult);
      
      // send the final result to clients
      broadcastMessage('finalResult', finalResult);
      
      // reset results
      results = [];
  }
  }else if(msg.type === 'startProcess') {
    // handle and send the dataset
    const processed_data = handleDataSet_Server(clients.size);
    sendSourceData(processed_data);
  }else if(msg.type === 'avgError') {
    arrayError.push(msg.data);
    if(arrayError.length === clients.size){
      const result = reduceResult(arrayError);
      broadcastMessage('reducedError', result);
      arrayError = [];
    }
  }else if(msg.type === 'gradient') {
    arrayGradient.push(msg.data);
    if(arrayGradient.length === 2){
      const result = reduceResult(arrayGradient);
      broadcastMessage('reducedGradient', result);
      arrayGradient = [];
    }
  } 
}
console.log('Server runs on port 8080')