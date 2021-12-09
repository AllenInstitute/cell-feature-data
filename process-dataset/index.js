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
            megasetInfo.datasets.map(async (datasetName) => {
                const data = await fsPromises.readFile(`${datasetReadFolder}/${datasetName}`)
                const jsonData = JSON.parse(data);
                const dataset = dataPrep.initialize(jsonData, schemas.datasetSchema)
                dataset.production = false; // by default upload all datasets as a staging set

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
        megasetInfo.datasets = [dataset]

        await firestore.collection("dataset-descriptions").doc(megasetInfo.name).set(megasetInfo, {
            merge: true
        });
    }

    return process.exit(0);

    const {
        name,
        version,
    } = datasetJson;
    const firebaseHandler = new FirebaseHandler(name, version);
    console.log("Dataset id:", firebaseHandler.id)
    const fileNames = {
        featureDefs: datasetJson.featureDefsPath,
        featuresData: datasetJson.featuresDataPath,
        cellLineData: datasetJson.cellLineDataPath,
    }
    for (const key in fileNames) {
        if (Object.hasOwnProperty.call(fileNames, key)) {
            if (!fileNames[key]) {
                console.error("Missing file name:", key);
                process.exit(1);
            }
        }
    }

    // 1. upload dataset description and manifest
    const manifestRef = await uploadDatasetAndManifest(firebaseHandler, datasetJson, datasetReadFolder, fileNames.featureDefs);
    // 2. check dataset feature defs for new features, upload them if needed
    const featureDefRef = await uploadFeatureDefs(firebaseHandler, datasetReadFolder, fileNames.featureDefs);
    // 3. upload cell lines TODO: add check if cell line is already there
    const formattedCellLines = await uploadCellLines(firebaseHandler, datasetReadFolder, fileNames.cellLineData);
    // 4. format file info, write to json locally
    await formatAndWritePerCellJsons(datasetReadFolder, TEMP_FOLDER, fileNames.featuresData, formattedCellLines);
    // 5. upload file info per cell
    const fileInfoLocation = await uploadFileInfo(firebaseHandler, TEMP_FOLDER, skipFileInfoUpload === "true");
    // 6. upload cell line subtotals
    await uploadCellCountsPerCellLine(TEMP_FOLDER, firebaseHandler);
    // 7. upload json to aws
    const awsLocation = await uploadFileToS3(firebaseHandler.id, TEMP_FOLDER);
    // 8. upload card image
    const awsImageLocation = await uploadDatasetImage(firebaseHandler, datasetReadFolder, datasetJson.image);
    // 9. update dataset manifest with location for data
    const updateToManifest = {
        ...featureDefRef,
        ...fileInfoLocation, 
        ...awsLocation,
    }
    console.log("updating manifest", updateToManifest)
    await firebaseHandler.updateDatasetDoc({
        ...manifestRef,
        ...awsImageLocation,
    })
    await firebaseHandler.updateManifest(updateToManifest)
    process.exit(0)
}    

processDataset()
