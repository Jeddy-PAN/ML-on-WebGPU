import { readFileSync } from 'fs';

// length of splited dataset
let chunkSize = 0;

// split the dataset
function splitDataSet(data, number){
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  if (number <= 0) {
    return [data];
  }

  // 如果划分数量大于数据集长度，则将length设置为数据集长度
  number = Math.min(number, data.length);

  // 计算每个子集的大概大小
  chunkSize = Math.ceil(data.length / number);

  // 存储划分后的数据集
  const result = [];

  // 划分数据
  for (let i = 0; i < number; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      if (start < data.length) {
        result.push(data.slice(start, end));
      }
  }

  return result;
}

// get and handle the dataset
function getDataSet(){
    console.log('getCSV called');
    const dataset = 'dataClass1.csv';
    const path = `public/Datasets/${dataset}`;
    const fileContent = readFileSync(path, 'utf8');
    const lines = fileContent.trim().split('\n');
    const data = lines.map(line => 
        line.split(',').map(value => parseFloat(value))
    );
    return data;
}

// main operation 
export function handleDataSet_Server(num_clients) {
  // get dataset
  const source_data = getDataSet();

  // devide dataset
  const processed_data = splitDataSet(source_data, num_clients);

  return processed_data;

}

// reduce the result 
export function reduceResult(dataArray) {
  const total = chunkSize * 2;
  // const n = dataArray.length;
  let result = 0.0;
  dataArray.forEach(data => {
    result += data * chunkSize;
  });
  return result / total;
}

