const fsPromises = require('fs').promises;
const dataPrep = require("../../data-validation/data-prep");
const schemas = require("../../data-validation/full-schema");

const uploadManifest = async (firebaseHandler, datasetJson, featureDefsData) => {
    console.log("uploading dataset description and manifest...");

    const manifest = dataPrep.initialize(datasetJson, schemas.manifestSchema)
    // will be updated when the data is uploaded
    manifest.cellLineDataPath = "";
    manifest.albumPath = "";
    manifest.featuresDataPath = "";
    manifest.featureDefsPath = "";
    manifest.featuresDisplayOrder = featureDefsData.map(ele => ele.key)
    manifest.viewerSettingsPath = "";

    const manifestCheck = dataPrep.validate(manifest, schemas.manifest)
    if (manifestCheck.valid) {
        // upload manifest
        await firebaseHandler.uploadManifest(manifest)
    } else {
        console.log(manifestCheck.error)
        process.exit(1);
    }
    console.log("uploading manifest complete");
    return {
        manifest: `${firebaseHandler.manifestEndpoint}/${firebaseHandler.id}`
    }
}

module.exports = uploadManifest;