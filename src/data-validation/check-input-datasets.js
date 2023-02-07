const fsPromises = require("fs").promises;
const Ajv = require("ajv").default;

const {
  readDatasetJson,
  readAndParseFile,
  readPossibleZippedFile,
} = require("../utils");
const dataPrep = require("./data-prep");

// referenced partial schemas
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
  inputImages,
  featureDef,
  inputMegaset,
  inputDatasetInfo,
  inputMeasuredFeatures,
  inputDataSet,
];
const INPUT_DATASET_SCHEMA_FILE = "input-dataset.schema.json";
const INPUT_MEGASET_SCHEMA_FILE = "input-megaset.schema.json";

const ajv = new Ajv({
  coerceTypes: true,
  removeAdditional: true,
  schemas: INPUT_DATASET_SCHEMA,
});

const checkForError = (fileName, json, schemaFileName) => {
  const { valid, error } = dataPrep.validate(
    json,
    ajv.getSchema(schemaFileName)
  );
  if (!valid) {
    console.log(
      "\x1b[0m",
      `${fileName}`,
      "\x1b[31m",
      `failed because: ${JSON.stringify(error)}`,
      "\x1b[0m"
    );
    return true;
  } else {
    console.log(
      "\x1b[0m",
      `${fileName}: check against ${schemaFileName}`,
      "\x1b[32m",
      "passed",
      "\x1b[0m"
    );
    return false;
  }
};

const unpackInputDataset = async (datasetReadFolder) => {
  const datasetJson = await readDatasetJson(datasetReadFolder);
  const featureDefs = await readAndParseFile(
    `${datasetReadFolder}/${datasetJson.featureDefsPath}`
  );
  const images = await readAndParseFile(
    `${datasetReadFolder}/${datasetJson.viewerSettingsPath}`
  );
  const measuredFeatures = await readPossibleZippedFile(
    datasetReadFolder,
    datasetJson.featuresDataPath
  );

  const inputDataset = {
    dataset: datasetJson,
    "feature-defs": featureDefs,
    "measured-features": measuredFeatures,
    images: images,
  };
  return inputDataset;
};

const validateDatasets = () => {
  fsPromises
    .readdir("./data")
    .then(async (files) => {
      const foldersToCheck = [];

      let hasError = false;
      const checkSingleDatasetInput = async (datasetFolder) => {
        const inputDataset = await unpackInputDataset(datasetFolder);
        const foundError = checkForError(
          `${datasetFolder}`,
          inputDataset,
          INPUT_DATASET_SCHEMA_FILE
        );
        if (foundError) {
          hasError = true;
        }
      };

      for (const name of files) {
        try {
          const subFiles = await fsPromises.readdir(name);
          if (subFiles.includes("dataset.json")) {
            foldersToCheck.push(name);
          }
        } catch (error) {}
      }
      for (const datasetFolder of foldersToCheck) {
        const topLevelJson = await readDatasetJson(datasetFolder);
        if (topLevelJson.datasets) {
          // is a megaset, need to check both megaset
          // file and each dataset folder
          const foundError = checkForError(
            `${datasetFolder}/dataset.json`,
            topLevelJson,
            INPUT_MEGASET_SCHEMA_FILE
          );
          if (foundError) {
            hasError = true;
          }
          for (const subDatasetFolder of topLevelJson.datasets) {
            const datasetReadFolder = `${datasetFolder}/${subDatasetFolder}`;
            await checkSingleDatasetInput(datasetReadFolder);
          }
        } else {
          await checkSingleDatasetInput(datasetFolder);
        }
      }
      return hasError;
    })
    .then((hasError) => {
      if (hasError) {
        console.log("\x1b[31m");
        throw Error("Validation failed");
      }
    });
};

validateDatasets();
