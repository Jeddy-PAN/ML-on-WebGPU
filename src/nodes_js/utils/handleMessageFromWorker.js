export function handleMessageFromWorker(clientsByRole, msg){
  switch(msg.type){
    case 'startProcess':
      console.log('Server: Workers want to get data');
      clientsByRole['dao'].forEach(client => {
        client.send(JSON.stringify({
          type: 'getData',
          data: clientsByRole['worker'].size()
        }));
      });
      break;
    case 'result':
      console.log('Server: Receive result from workers');
  }
}