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

// Extract out just the fields that will go into Firebase under 
// dataset-descriptions/{megaset name}
const getDatasetInfo = (datasetJson) => {
    const datasetInfo = dataPrep.initialize(datasetJson, schemas.datasetSchema)
    datasetInfo.production = false; // by default upload all datasets as a staging set
    return datasetInfo;
}

const getDatasetId = (dataset) => {
    return `${dataset.name}_v${dataset.version}`;
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
    
    // Top-level megaset structure for Firebase
    let megasetInfo = {
        title: "",
        name: "",
        publications: [],
        // User provides datasets as an array of dataset names, but we will be
        // transforming it to an object with ids as keys
        datasets: {},
        production: false,
    };

    // This will hold all data from dataset.json files for individual datasets, 
    // with dataset IDs as keys
    const datasetJsons = {};
    
    // Read in the dataset.json at the top level of the provided directory
    const topLevelJson = await readDatasetJson(inputFolder);
    
    if (topLevelJson.datasets) { // Datasets are provided as a megaset (nested datasets exist)
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
                const datasetInfo = getDatasetInfo(datasetJson);
                const id = getDatasetId(datasetInfo);
                acc[id] = datasetInfo;
                // Also save the entire datasetJson with the same id to datasetJsons, which will be used in the "process-one-dataset" script to upload and save the rest of the data
                datasetJsons[id] = datasetJson;
                return acc;
            }, {})
        })
    } else { 
        // A single dataset is provided (no nested datasets). It will be saved as a megaset with
        // just one dataset in it. 
        
        // Do the same processing as for a real megaset, but much simpler since all data is
        // contained in the top-level dataset.json
        megasetInfo.title = topLevelJson.title;
        megasetInfo.name = topLevelJson.name;
        topLevelJson.datasetReadFolder = inputFolder;

        const datasetInfo = getDatasetInfo(topLevelJson);
        const id = getDatasetId(datasetInfo);
        megasetInfo.datasets = {
            [id]: datasetInfo
        }
        datasetJsons[id] = topLevelJson;
    }
  
 
    // Upload the dataset description (megasetInfo) to Firebase
    console.log("uploading data description...")
    await firestore.collection("dataset-descriptions").doc(megasetInfo.name).set(megasetInfo, {
        merge: true
    });
    console.log("uploading data description complete");
    
    // For each dataset in the megaset, process the rest of the data
    const datasetIds = Object.keys(megasetInfo.datasets);
    await Promise.all(datasetIds.map(async (id) => {
        await processSingleDataset(id, datasetJsons[id], shouldSkipFileInfoUpload, megasetInfo.name)
    }));

    return process.exit(0);
}

processMegaset();
