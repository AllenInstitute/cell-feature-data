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
    
    // Top-level megaset data
    let megasetInfo = {
        title: "",
        name: "",
        publications: [],
        datasets: {},
        production: false,
    };
    
    const datasetJson = await readDatasetJson(inputFolder);

    if (datasetJson.datasets) { // Datasets are provided as a megaset
        const jsonDocs = {}
        megasetInfo = {...datasetJson, production: false};

        megasetInfo.datasets = await Promise.all(
            megasetInfo.datasets.map(async (datasetPath) => {
                const datasetReadFolder = `${inputFolder}/${datasetPath}`
                const data = await readDatasetInfo(datasetReadFolder)
                data.datasetReadFolder = datasetReadFolder;
                return data;
            })
        ).then(unpackedDatasets => {
            return unpackedDatasets.reduce((acc, jsonData) => {
                const dataset = dataPrep.initialize(jsonData, schemas.datasetSchema)
                dataset.production = false; // by default upload all datasets as a staging set
                const id = `${dataset.name}_v${dataset.version}`;
                jsonDocs[id] = jsonData;
                acc[id] = dataset;
                return acc;
            }, {})
        })

        await firestore.collection("dataset-descriptions").doc(megasetInfo.name).set(megasetInfo, {
            merge: true
        });

        await Promise.all(Object.keys(megasetInfo.datasets).map(async (id) => {
            await processSingleDataset(id, jsonDocs[id], shouldSkipFileInfoUpload, megasetInfo.name)
        }));
    } else { // A single dataset is provided
        // Make everything DRY
        megasetInfo.title = datasetJson.title;
        megasetInfo.name = datasetJson.name;
        datasetJson.datasetReadFolder = inputFolder;

        // TODO: factor out below so it doesn't repeat in above block too
        const dataset = dataPrep.initialize(datasetJson, schemas.datasetSchema)
        dataset.production = false; // by default upload all datasets as a staging set
        const id = `${dataset.name}_v${dataset.version}`;
        megasetInfo.datasets = {
            [id]: dataset
        }

        await firestore.collection("dataset-descriptions").doc(megasetInfo.name).set(megasetInfo, {
            merge: true
        });

        await processSingleDataset(id, datasetJson, shouldSkipFileInfoUpload, datasetJson.name);
    }

    return process.exit(0);
}

processMegaset();