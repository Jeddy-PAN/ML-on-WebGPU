import Papa from 'papaparse';
import { useComputeGraphStore } from '../../store/computeGraphStore';
import Data from '../../utils/backend/CPU/tools/DataClass';
import { WebSocket } from 'ws';

export function handleDataSet_Server(clients: WebSocket[]): void {
  // get dataset
  console.log('getCSV called');
  const dataset: string = 'easy_class.';
  const inputString: string =
    dataset === 'easy_class.'
      ? '/Datasets/dataClass1.csv'
      : dataset === 'medium_class.'
        ? '/Datasets/dataClass2.csv'
        : dataset === 'hard_class.'
          ? '/Datasets/dataClass3.csv'
          : '';

  // handle dataset
  const computeGraphStore = useComputeGraphStore();
  Papa.parse(inputString, {
    header: false,
    download: true,
    skipEmptyLines: true,
    delimiter: ',',
    complete: (results: { data: unknown[] }) => {
			const dataArray = results.data.map((row: unknown) =>
				Object.values(row as { [key: string]: string }).map((value: string, index: number) => (index == 0 ? Number(value) : Number(value)))
			);

			const data = new Data(dataArray, 2, 10000, 2, 2, computeGraphStore.batchSize);
			data.dataSetName = 'classify';
			console.log('data is ready');
			console.log(data.getInputData());

      // send dataset
      clients[0].send(JSON.stringify({
        type: 'data',
        data: data
      }));
    },
  });
}