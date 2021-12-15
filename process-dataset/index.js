const fsPromises = require('fs').promises;
const {
    firestore
} = require('../firebase/setup-firebase');

const dataPrep = require("./data-validation/data-prep");
const schemas = require("./data-validation/schema");
const processSingleDataset = require("./process-single-dataset");

const args = process.argv.slice(2);
console.log('Received: ', args);

const inputFolder = args[0];
const shouldSkipFileInfoUpload = args[1] === "true";

const readDatasetJson = async (folder) => {
    const data = await fsPromises.readFile(`${folder}/dataset.json`)
    return JSON.parse(data)
}

const processMegaset = async () => {
    if (!inputFolder) {
        console.log("NEED A DATASET FOLDER TO PROCESS")
        process.exit(1)
    }
    
    fsPromises.readdir(inputFolder)
        .catch ((error) => {
            console.log("COULDN'T READ DIRECTORY:", error)
        }) 
    
    // Top-level megaset structure
    let megasetInfo = {
        title: "",
        name: "",
        publications: [],
        datasets: {},
        production: false,
    };
    
    // Read in the dataset.json at the top level of the provided directory as an object
    const topLevelJson = await readDatasetJson(inputFolder);

    if (topLevelJson.datasets) { // Datasets are provided as a megaset
        const datasetJsons = {};
        megasetInfo = {...topLevelJson, production: false};
        
        // Unpack individual datasets and save data as megasetInfo.datasets and to datasetJsons
        megasetInfo.datasets = await Promise.all(
            // Read in individual datasets from the sub-folders listed in topLevelJson.datasets
            topLevelJson.datasets.map(async (datasetFolder) => {
                const datasetReadFolder = `${inputFolder}/${datasetFolder}`
                const datasetJson = await readDatasetJson(datasetReadFolder);
                // Need to save the path to the dataset sub-folder for later processing steps
                datasetJson.datasetReadFolder = datasetReadFolder;
                return datasetJson;
            })
        ).then(datasetJsonArr => {
            // Turn array of datasets into an object (megasetInfo.datasets) with dataset ids
            // as keys and objects containing pared-down info about individual datasets as values
            return datasetJsonArr.reduce((acc, datasetJson) => {
                const datasetInfo = dataPrep.initialize(datasetJson, schemas.datasetSchema)
                const id = `${datasetInfo.name}_v${datasetInfo.version}`;
                datasetInfo.production = false; // by default upload all datasets as a staging set
                acc[id] = datasetInfo;
                // Also save the entire datasetJson with the same id to datasetJsons, for uploading
                // to AWS
                datasetJsons[id] = datasetJson;
                return acc;
            }, {})
        })

        // Upload the dataset description (megasetInfo) to Firebase
        await firestore.collection("dataset-descriptions").doc(megasetInfo.name).set(megasetInfo, {
            merge: true
        });

        // Process the rest of data for each dataset in the megaset
        await Promise.all(Object.keys(megasetInfo.datasets).map(async (id) => {
            await processSingleDataset(id, datasetJsons[id], shouldSkipFileInfoUpload, megasetInfo.name)
        }));
    } else { // A single dataset is provided
        // Make everything DRY
        megasetInfo.title = topLevelJson.title;
        megasetInfo.name = topLevelJson.name;
        topLevelJson.datasetReadFolder = inputFolder;

        // TODO: factor out below so it doesn't repeat in above block too
        const dataset = dataPrep.initialize(topLevelJson, schemas.datasetSchema)
        dataset.production = false; // by default upload all datasets as a staging set
        const id = `${dataset.name}_v${dataset.version}`;
        megasetInfo.datasets = {
            [id]: dataset
        }

        await firestore.collection("dataset-descriptions").doc(megasetInfo.name).set(megasetInfo, {
            merge: true
        });

        await processSingleDataset(id, topLevelJson, shouldSkipFileInfoUpload, topLevelJson.name);
    }

    return process.exit(0);
}

processMegaset();