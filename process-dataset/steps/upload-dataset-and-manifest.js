const fsPromises = require('fs').promises;
const dataPrep = require("../data-validation/data-prep");
const schemas = require("../data-validation/schema");

const uploadDatasetAndManifest = async (firebaseHandler, datasetJson, readFolder, featureDefsFileName) => {
    console.log("uploading dataset description and manifest...");
    const readFeatureData = async () => {
        const data = await fsPromises.readFile(`${readFolder}/${featureDefsFileName}`)
        return JSON.parse(data)
    }

    const featureData = await readFeatureData();
    const dataset = dataPrep.initialize(datasetJson, schemas.datasetSchema)
    dataset.production = false; // by default upload all datasets as a staging set
    const manifest = dataPrep.initialize(datasetJson, schemas.manifestSchema)
    // will be updated when the data is uploaded
    manifest.cellLineDataPath = "";
    manifest.albumPath = "";
    manifest.featuresDataPath = "";
    manifest.featureDefsPath = "";
    manifest.featuresDisplayOrder = featureData.map(ele => ele.key)
    const datasetCheck = dataPrep.validate(dataset, schemas.dataset)
    const manifestCheck = dataPrep.validate(manifest, schemas.manifest)
    if (datasetCheck.valid) {
        // upload dataset
        await firebaseHandler.uploadDatasetDoc(dataset)
    } else {
        console.log(datasetCheck.error);
        process.exit(1);
    }
    if (manifestCheck.valid) {
        // upload manifest
        await firebaseHandler.uploadManifest(manifest)
    } else {
        console.log(manifestCheck.error)
        process.exit(1);
    }
    console.log("uploading dataset description and manifest complete");
    return {
        manifest: `${firebaseHandler.manifestEndpoint}/${firebaseHandler.id}`
    }
}

module.exports = uploadDatasetAndManifest;