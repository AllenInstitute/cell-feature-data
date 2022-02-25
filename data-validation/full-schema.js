const Ajv = require("ajv").default

// ref schemas
const refSchemas = [
    require("./schema/definitions.schema.json"),
    require("./schema/discrete-feature-options.schema.json"),
    require("./schema/array-items/discrete-feature-option.schema.json"),
    require("./schema/array-items/file-info.schema.json"),
    require("./schema/array-items/condensed-measured-feature.schema.json"),

]

const measuredFeaturesDocSchema = require("./schema/measured-features.schema.json");
const manifestSchema = require("./schema/manifest.schema.json");
const featureDefSchema = require("./schema/feature-def.schema.json");
const fileInfoSchema = require("./schema/file-info-doc.schema.json");
const datasetCardSchema = require("./schema/dataset-card.schema.json");

const ajv = new Ajv({
    coerceTypes: true,
    removeAdditional: true,
    schemas: [...refSchemas, datasetCardSchema, measuredFeaturesDocSchema, manifestSchema, featureDefSchema, fileInfoSchema]
})
module.exports = {
    dataset: ajv.getSchema("dataset-card.schema.json"),
    manifest: ajv.getSchema("manifest.schema.json"),
    featureDef: ajv.getSchema("feature-def.schema.json"),
    fileInfo: ajv.getSchema("file-info-doc.schema.json"),
    measuredFeaturesDoc: ajv.getSchema("measured-features.schema.json")

}