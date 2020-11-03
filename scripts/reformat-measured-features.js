
const fsPromises = require('fs').promises;

const features = require('../data/measured-features');
const FirebaseHandler = require('./firebase-handler');

const firebaseHandler = new FirebaseHandler('v1_1');

const writeCellFeatureData = () => {

    return fsPromises.readFile('./cell-feature-analysis.json')
        .then((data) => JSON.parse(data))
        .then((json) => {
            const writeBatch = (batch) => Promise.all(batch)
            const makePromises = (spliceList) => features.map((feature) => {
               const featureName = `${feature.displayName} (${feature.unit})`
               return spliceList.map((cellData) => {
                   const value = cellData.measured_features[featureName];
                   if (!value && value !== 0) {
                       console.log('feature not formatted right', featureName, cellData)
                       return Promise.resolve()
                   }
                   if (!cellData.file_info.CellId) {
                       return Promise.resolve()
                   }
                   return firebaseHandler.writeData('measured-features-values', feature.key, { [cellData.file_info.CellId.toString()] : value})
               })
           })
            const makeBatch = () => {
                let batchToWrite = json.splice(0, 500);
                console.log('writing set', batchToWrite.length)
                if (batchToWrite.length) {
                    return writeBatch(makePromises(batchToWrite))
                        .then(() => {
                            console.log('wrote', 'left:', json.length)
                            setTimeout(makeBatch, 10000) // giving some write time 
                        })
                } else {
                    console.log(batchToWrite, json.length)
                    return Promise.resolve()
                }
            }
            return makeBatch()

        })

        .catch(console.log)

}

writeCellFeatureData()