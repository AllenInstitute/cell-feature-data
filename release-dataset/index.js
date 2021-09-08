const fsPromises = require('fs').promises;

const args = process.argv.slice(2);
console.log('Received: ', args);

const FirebaseHandler = require('../firebase/firebase-handler');

const datasetReadFolder = args[0];

const readDatasetInfo = async () => {
    const data = await fsPromises.readFile(`${datasetReadFolder}/dataset.json`)
    return JSON.parse(data)
}

const releaseDataset = async () => {

    if (!datasetReadFolder) {
        console.log("NEED A DATASET FOLDER TO RELEASE")
        process.exit(1)
    }

    fsPromises.readdir(datasetReadFolder)
        .catch((error) => {
            console.log("COULDN'T READ DIRECTORY:", error)
        })

    const datasetJson = await readDatasetInfo()
    const {
        name, 
        version,
    } = datasetJson;
    const firebaseHandler = new FirebaseHandler(name, version);
    const { id } = firebaseHandler;
    console.log("Dataset id:", id)
    await firebaseHandler.updateDatasetDoc({
        production: true
    })
    console.log(`${id} is now released to production`)
    process.exit(0)

}

releaseDataset()
