const uploadDatasetAndManifest = require("./steps/upload-dataset-and-manifest");
const uploadFeatureDefs = require("./steps/upload-feature-defs");
const uploadCellLines = require("./steps/upload-cell-lines");
const formatAndWritePerCellJsons = require("./steps/write-per-cell-jsons");
const uploadCellCountsPerCellLine = require("./steps/upload-cell-counts");
const uploadFileInfo = require("./steps/upload-file-info");
const uploadFileToS3 = require("./steps/upload-to-aws");
const uploadDatasetImage = require("./steps/upload-dataset-image");

const FirebaseHandler = require('../firebase/firebase-handler');

const TEMP_FOLDER = "./data";

const processSingleDataset = async (id, jsonDoc, skipFileInfoUpload, megasetName) => {
    const {
        name,
        datasetReadFolder
    } = jsonDoc;
    const firebaseHandler = new FirebaseHandler(id, name, megasetName);
    console.log("Dataset id:", firebaseHandler.id)
    const fileNames = {
        featureDefs: jsonDoc.featureDefsPath,
        featuresData: jsonDoc.featuresDataPath,
        cellLineData: jsonDoc.cellLineDataPath,
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
    const manifestRef = await uploadDatasetAndManifest(firebaseHandler, jsonDoc, datasetReadFolder, fileNames.featureDefs);
    // 2. check dataset feature defs for new features, upload them if needed
    const featureDefRef = await uploadFeatureDefs(firebaseHandler, datasetReadFolder, fileNames.featureDefs);
    // 3. upload cell lines TODO: add check if cell line is already there
    const formattedCellLines = await uploadCellLines(firebaseHandler, datasetReadFolder, fileNames.cellLineData);
    // 4. format file info, write to json locally
    await formatAndWritePerCellJsons(datasetReadFolder, TEMP_FOLDER, fileNames.featuresData, formattedCellLines);
    // 5. upload file info per cell
    const fileInfoLocation = await uploadFileInfo(firebaseHandler, TEMP_FOLDER, skipFileInfoUpload);
    // 6. upload cell line subtotals
    await uploadCellCountsPerCellLine(TEMP_FOLDER, firebaseHandler);
    // 7. upload json to aws
    const awsLocation = await uploadFileToS3(firebaseHandler.id, TEMP_FOLDER);
    // 8. upload card image
    const awsImageLocation = await uploadDatasetImage(firebaseHandler, datasetReadFolder, jsonDoc.image);
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
}

module.exports = processSingleDataset;