const Ajv = require("ajv").default;

const refSchemas = [
  require("./schema/definitions.schema.json"),
  require("./schema/discrete-feature-options.schema.json"),
  require("./schema/array-items/discrete-feature-option.schema.json"),
  require("./schema/array-items/file-info.schema.json"),
  require("./schema/array-items/input-measured-features.schema.json"),
];

// Schemas that describe the handoff files that define a dataset or a
// collection of datasets.
const inputMegaset = require("./schema/input-megaset.schema.json");
const inputDatasetInfo = require("./schema/input-dataset-info.schema.json");
const inputMeasuredFeatures = require("./schema/input-measured-features-doc.schema.json");
const inputDataSet = require("./schema/input-dataset.schema.json");
const inputImages = require("./schema/images.schema.json");
const featureDef = require("./schema/feature-def.schema.json");

const INPUT_DATASET_SCHEMA = [
  ...refSchemas,
  inputMegaset,
  inputDatasetInfo,
  inputMeasuredFeatures,
  inputDataSet,
  inputImages,
  featureDef,
];

const getInputDatasetSchema = () => {
  return new Ajv({
    coerceTypes: true,
    removeAdditional: true,
    schemas: INPUT_DATASET_SCHEMA,
  });
};

module.exports = {
  getInputDatasetSchema
};
