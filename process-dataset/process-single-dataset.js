const uploadDatasetAndManifest = require("./steps/upload-manifest");
const uploadFeatureDefs = require("./steps/upload-feature-defs");
const uploadCellLines = require("./steps/upload-cell-lines");
const formatAndWritePerCellJsons = require("./steps/write-per-cell-jsons");
const uploadCellCountsPerCellLine = require("./steps/upload-cell-counts");
const uploadFileInfo = require("./steps/upload-file-info");
const uploadFeaturesFileToS3 = require("./steps/upload-features-to-aws");
const uploadFileToS3 = require("./steps/upload-file-to-aws");
const uploadDatasetImage = require("./steps/upload-dataset-image");

const FirebaseHandler = require('../firebase/firebase-handler');

const TEMP_FOLDER = "./data";

const processSingleDataset = async (id, datasetJson, shouldSkipFileInfoUpload, megasetName) => {
    const {
        name,
        datasetReadFolder
    } = datasetJson;
    const firebaseHandler = new FirebaseHandler(id, name, megasetName);
    console.log("Dataset id:", firebaseHandler.id)
    const fileNames = {
        featureDefs: datasetJson.featureDefsPath,
        featuresData: datasetJson.featuresDataPath,
        cellLineData: datasetJson.cellLineDataPath,
        viewerSettingsData: datasetJson.viewerSettingsPath,
    }
    for (const key in fileNames) {
        if (Object.hasOwnProperty.call(fileNames, key)) {
            if (!fileNames[key]) {
                console.error("Missing file name:", key);
                process.exit(1);
            }
        }
    }

    // 1. upload manifest
    const manifestRef = await uploadDatasetAndManifest(firebaseHandler, datasetJson, datasetReadFolder, fileNames.featureDefs);
    // 2. check dataset feature defs for new features, upload them if needed
    const featureDefRef = await uploadFeatureDefs(firebaseHandler, datasetReadFolder, fileNames.featureDefs);
    // 3. upload cell lines TODO: add check if cell line is already there
    const formattedCellLines = await uploadCellLines(firebaseHandler, datasetReadFolder, fileNames.cellLineData);
    // 4. format file info, write to json locally
    await formatAndWritePerCellJsons(datasetReadFolder, TEMP_FOLDER, fileNames.featuresData, formattedCellLines);
    // 5. upload file info per cell
    const fileInfoLocation = await uploadFileInfo(firebaseHandler, TEMP_FOLDER, shouldSkipFileInfoUpload);
    // 6. upload cell line subtotals
    await uploadCellCountsPerCellLine(TEMP_FOLDER, firebaseHandler);
    // 7. upload json to aws
    const awsLocation = await uploadFeaturesFileToS3(firebaseHandler.id, TEMP_FOLDER);
    // 8. upload viewer settings json to aws
    const awsViewerSettingsLocation = await uploadFileToS3(firebaseHandler.id, datasetReadFolder, fileNames.viewerSettingsData);
    // 9. upload card image
    const awsImageLocation = await uploadDatasetImage(firebaseHandler, datasetReadFolder, datasetJson.image);
    // 10. update dataset manifest with location for data
    const updateToManifest = {
        ...featureDefRef,
        ...fileInfoLocation,
        ...awsLocation,
        viewerSettingsPath: awsViewerSettingsLocation
    }
    console.log("updating manifest", updateToManifest)
    await firebaseHandler.updateDatasetDoc({
        ...manifestRef,
        ...awsImageLocation,
    })
    await firebaseHandler.updateManifest(updateToManifest)
}

module.exports = processSingleDataset;