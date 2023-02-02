const fsPromises = require('fs').promises;

const uploadManifest = require("./steps/upload-manifest");
const uploadFeatureDefs = require("./steps/upload-feature-defs");
const formatAndWritePerCellJsons = require("./steps/write-per-cell-jsons");
const uploadFileInfo = require("./steps/upload-file-info");
const uploadFeaturesFileToS3 = require("./steps/upload-features-to-aws");
const uploadFileToS3 = require("./steps/upload-file-to-aws");
const uploadDatasetImage = require("./steps/upload-dataset-image");

const FirebaseHandler = require('../firebase/firebase-handler');

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
    const readFeatureData = async () => {
        const data = await fsPromises.readFile(`${datasetReadFolder}/${fileNames.featureDefs}`)
        return JSON.parse(data)
    }
    const defaultGroupBy = datasetJson.groupBy.default;
    const defaultGroupByIndex = datasetJson.featuresDataOrder.indexOf(defaultGroupBy);

    const featureDefsData = await readFeatureData();

    const TEMP_FOLDER = "./data/" + id;

    await fsPromises.mkdir(TEMP_FOLDER, { recursive: true });

    // 1. upload dataset description and manifest
    const manifestRef = await uploadManifest(firebaseHandler, datasetJson, featureDefsData);
    // 2. check dataset feature defs for new features, upload them if needed
    const featureDefRef = await uploadFeatureDefs(firebaseHandler, featureDefsData);
    // 3. format file info, write to json locally
    await formatAndWritePerCellJsons(firebaseHandler, datasetReadFolder, TEMP_FOLDER, fileNames.featuresData, featureDefsData, defaultGroupBy, defaultGroupByIndex);
    // 4. upload file info per cell
    const fileInfoLocation = await uploadFileInfo(firebaseHandler, TEMP_FOLDER, shouldSkipFileInfoUpload);
    // 5. upload json to aws
    const awsLocation = await uploadFeaturesFileToS3(firebaseHandler.id, TEMP_FOLDER);
    // 6. upload viewer settings json to aws
    const awsViewerSettingsLocation = await uploadFileToS3(firebaseHandler.id, datasetReadFolder, fileNames.viewerSettingsData);
    // 7. upload card image
    const awsImageLocation = await uploadDatasetImage(firebaseHandler, datasetReadFolder, datasetJson.image);
    // 8. update dataset manifest with location for data
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