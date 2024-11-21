export function handleMessageFromDao(clientsByRole, msg){
  switch(msg.type){
    case 'data':
      console.log('Server: Get Data Successfully');
      console.log('Send data to workers...');
      const data = msg.data;
      let index = -1;
      clientsByRole['worker'].forEach(client => {
        index++;
        client.send(JSON.stringify({
          type: 'data',
          data: data[index]
        }));
      });
      break;
  }
}