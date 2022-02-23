const Ajv = require("ajv").default

// ref schemas
const refSchemas = [
    require("./schema/sub-schema/dataset-card.schema.json"),
    require("./schema/sub-schema/publication.schema.json"),
    require("./schema/sub-schema/selection-setting.schema.json"),
    require("./schema/discrete-feature-options.schema.json"),
    require("./schema/sub-schema/discrete-feature-option.schema.json"),
    require("./schema/sub-schema/file-info.schema.json"),
    require("./schema/sub-schema/condensed-measured-feature.schema.json"),

]

const measuredFeaturesDocSchema = require("./schema/measured-features.schema.json");
const manifestSchema = require("./schema/manifest.schema.json");
const featureDefSchema = require("./schema/feature-def.schema.json");
const fileInfoSchema = require("./schema/file-info-doc.schema.json");
const imagesSchema = require("./schema/images.schema.json");

const ajv = new Ajv({
    coerceTypes: true,
    removeAdditional: true,
    schemas: [...refSchemas, measuredFeaturesDocSchema, manifestSchema, featureDefSchema, fileInfoSchema, imagesSchema]
})
module.exports = {
    dataset: ajv.getSchema("sub-schema/dataset-card.schema.json"),
    manifest: ajv.getSchema("manifest.schema.json"),
    featureDef: ajv.getSchema("feature-def.schema.json"),
    fileInfo: ajv.getSchema("file-info-doc.schema.json"),
    measuredFeaturesDoc: ajv.getSchema("measured-features.schema.json"),
    images: ajv.getSchema("images.schema.json")
}