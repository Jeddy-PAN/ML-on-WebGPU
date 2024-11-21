import Data from "../../utils/backend/CPU/tools/DataClass";
import setUpModel from "../../utils/backend/CPU/ModelSetup/setUpModel";
import { useComputeGraphStore } from "../../store/computeGraphStore";

computeGraphStore = useComputeGraphStore();

export function startTraining(dataArray){
  const data = new Data(dataArray, 2, 5000, 2, 2, computeGraphStore.batchSize);
  data.dataSetName = 'classify';
  setUpModel(data);
}