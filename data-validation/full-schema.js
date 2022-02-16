const Ajv = require("ajv").default
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}
const fsPromises = require('fs').promises;

const readSchema = async (fileName) => {
    const data = await fsPromises.readFile(`./${fileName}`)
    return JSON.parse(data)
}

const measuredFeaturesDocSchema = await readSchema("measured-features.schema.json")
module.exports = {
    datasetSchema: await readSchema("dataset.schema.json"),
    manifestSchema: await readSchema("manifest.schema.json"),
    featureDefSchema: await readSchema("feature-def.schema.json"),
    fileInfoSchema: await readSchema("file-info.schema.json"),
    dataset: ajv.compile(datasetSchema),
    manifest: ajv.compile(manifestSchema),
    featureDef: ajv.compile(featureDefSchema),
    fileInfo: ajv.compile(fileInfoSchema),
    measuredFeaturesDoc: ajv.compile(measuredFeaturesDocSchema)
}