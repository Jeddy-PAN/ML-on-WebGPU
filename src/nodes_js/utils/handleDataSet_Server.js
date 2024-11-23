import { readFileSync } from 'fs';

let chunk_length = 0;

export function handleDataSet_Server(clients) {
  // get dataset
  console.log('getCSV called');
  const dataset = 'dataClass1.csv';
  const path = `public/Datasets/${dataset}`;
  const fileContent = readFileSync(path, 'utf8');
  const lines = fileContent.trim().split('\n');
  const data = lines.map(line => 
      line.split(',').map(value => parseFloat(value))
  );
  // console.log(data.length, data);

  // handle dataset
  if(clients.length === 2){
    const mid = Math.floor(data.length/2);
    chunk_length = mid;
    const chunk1 = data.slice(0, mid);
    const chunk2 = data.slice(mid);
    console.log(chunk1, chunk2);

    clients[0].send(JSON.stringify({
      type: 'data',
      data: chunk1
    }));
  
    clients[1].send(JSON.stringify({
      type: 'data',
      data: chunk2
    }));
  }

}

export function reduceResult(dataArray) {
  const total = chunk_length * 2;
  // const n = dataArray.length;
  let result = 0.0;
  dataArray.forEach(data => {
    result += data * chunk_length;
  });
  return result / total;
}

