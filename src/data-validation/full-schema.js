const Ajv = require("ajv").default

// ref schemas
const refSchemas = [
    require("./schema/definitions.schema.json"),
    require("./schema/discrete-feature-options.schema.json"),
    require("./schema/array-items/discrete-feature-option.schema.json"),
    require("./schema/array-items/file-info.schema.json"),
    require("./schema/array-items/condensed-measured-feature.schema.json"),
    require("./schema/array-items/input-measured-features.schema.json"),

]

const measuredFeaturesDocSchema = require("./schema/measured-features.schema.json");
const manifestSchema = require("./schema/manifest.schema.json");
const featureDefSchema = require("./schema/feature-def.schema.json");
const fileInfoSchema = require("./schema/file-info-doc.schema.json");
const imagesSchema = require("./schema/images.schema.json");
const datasetCardSchema = require("./schema/dataset-card.schema.json");
const iMeasuredFeaturesSchema = require("./schema/input-measured-features-doc.schema.json");
const iDatasetSchema = require("./schema/input-dataset.schema.json");
const iDatasetInfoSchema = require("./schema/input-dataset-info.schema.json");
const iMegasetSchema = require("./schema/input-megaset.schema.json");

const ajv = new Ajv({
    coerceTypes: true,
    removeAdditional: true,
    schemas: [
        ...refSchemas, 
        datasetCardSchema, 
        measuredFeaturesDocSchema, 
        manifestSchema,
        featureDefSchema, 
        fileInfoSchema, 
        imagesSchema,
        iMeasuredFeaturesSchema, 
        iDatasetSchema,
        iDatasetInfoSchema, 
        iMegasetSchema
    ]
})
module.exports = {
    dataset: ajv.getSchema("dataset-card.schema.json"),
    manifest: ajv.getSchema("manifest.schema.json"),
    featureDef: ajv.getSchema("feature-def.schema.json"),
    fileInfo: ajv.getSchema("file-info-doc.schema.json"),
    measuredFeaturesDoc: ajv.getSchema("measured-features.schema.json"),
    images: ajv.getSchema("images.schema.json"),
    iMeasuredFeatures: ajv.getSchema("input-measured-features-doc.schema.json"),
    iDataset: ajv.getSchema("input-dataset.schema.json"),
    iDatasetInfo: ajv.getSchema("input-dataset-info.schema.json"),
    iMegaset: ajv.getSchema("input-megaset.schema.json"),
    
}