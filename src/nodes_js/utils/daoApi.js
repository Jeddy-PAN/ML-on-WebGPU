import { readFileSync } from 'fs';

export function divideData(num_clients) {
  // get dataset
  console.log('getCSV called');
  const dataset = 'dataClass1.csv';
  const path = `public/Datasets/${dataset}`;
  const fileContent = readFileSync(path, 'utf8');
  const lines = fileContent.trim().split('\n');
  const data = lines.map(line => 
      line.split(',').map(value => parseFloat(value))
  );

  // handle dataset
  let chunks = [];
  if(num_clients === 2){
    const mid = Math.floor(data.length/2);
    const chunk1 = data.slice(0, mid);
    const chunk2 = data.slice(mid);
    chunks.push(chunk1);
    chunks.push(chunk2);
  }

  return chunks;

}
