const fsPromises = require('fs').promises;
const {
    firestore
} = require('../firebase/setup-firebase');

const uploadDatasetAndManifest = require("./steps/upload-dataset-and-manifest");
const uploadFeatureDefs = require("./steps/upload-feature-defs");
const uploadCellLines = require("./steps/upload-cell-lines");
const formatAndWritePerCellJsons = require("./steps/write-per-cell-jsons");
const uploadCellCountsPerCellLine = require("./steps/upload-cell-counts");
const uploadFileInfo = require("./steps/upload-file-info");
const uploadFileToS3 = require("./steps/upload-to-aws");
const uploadDatasetImage = require("./steps/upload-dataset-image")
const dataPrep = require("./data-validation/data-prep");
const schemas = require("./data-validation/schema");

const FirebaseHandler = require('../firebase/firebase-handler');

const TEMP_FOLDER = "./data";
const args = process.argv.slice(2);
console.log('Received: ', args);

const datasetReadFolder = args[0];
const skipFileInfoUpload = args[1];

// TODO: make more generic (take in whatever path)
const readDatasetInfo = async () => {
    const data = await fsPromises.readFile(`${datasetReadFolder}/dataset.json`)
    return JSON.parse(data)
}

const processDataset = async () => {

    if (!datasetReadFolder) {
        console.log("NEED A DATASET FOLDER TO PROCESS")
        process.exit(1)
    }
    
    fsPromises.readdir(datasetReadFolder)
        .catch ((error) => {
            console.log("COULDN'T READ DIRECTORY:", error)
        })
    
    const datasetJson = await readDatasetInfo()
    let megasetInfo = {
        title: "",
        name: "",
        publications: [],
        datasets: [],
        production: false,
    };
        
    if (datasetJson.datasets) {
        megasetInfo = {...datasetJson, production: false};

        const dataArray = await Promise.all(
            megasetInfo.datasets.map(async (datasetPath) => {
                const data = await fsPromises.readFile(`${datasetReadFolder}/${datasetPath}`)
                const jsonData = JSON.parse(data);
                const dataset = dataPrep.initialize(jsonData, schemas.datasetSchema)
                dataset.production = false; // by default upload all datasets as a staging set
                dataset.id = `${dataset.name}_v${dataset.version}`;

                return dataset;
            })
        )

        megasetInfo.datasets = dataArray;

        await firestore.collection("dataset-descriptions").doc(megasetInfo.name).set(megasetInfo, {
            merge: true
        });
    } else {
        megasetInfo.title = datasetJson.title;
        megasetInfo.name = datasetJson.name;

        // TODO: factor out below so it doesn't repeat in above block too
        const dataset = dataPrep.initialize(datasetJson, schemas.datasetSchema)
        dataset.production = false; // by default upload all datasets as a staging set
        dataset.id = `${dataset.name}_v${dataset.version}`;
        megasetInfo.datasets = [dataset]

        await firestore.collection("dataset-descriptions").doc(megasetInfo.name).set(megasetInfo, {
            merge: true
        });
    }

    return process.exit(0);
}

processDataset();