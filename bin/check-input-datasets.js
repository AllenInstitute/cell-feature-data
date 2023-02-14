const fsPromises = require("fs").promises;
const {
  getInputDatasetSchema,
} = require("../src/data-validation/get-input-dataset-schema");
const { DATA_FOLDER_NAME } = require("../src/process-single-dataset/constants");
const { readDatasetJson } = require("../src/utils");
const dataPrep = require("../src/data-validation/data-prep");
const unpackInputDataset = require("../src/data-validation/unpack-input-dataset");

// referenced partial schemas
const INPUT_DATASET_SCHEMA_FILE = "input-dataset.schema.json";
const INPUT_MEGASET_SCHEMA_FILE = "input-megaset.schema.json";
const ajv = getInputDatasetSchema();

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

const validateDatasets = () => {
  fsPromises
    .readdir(`./${DATA_FOLDER_NAME}`)
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
          const subFiles = await fsPromises.readdir(
            `./${DATA_FOLDER_NAME}/${name}`
          );
          if (subFiles.includes("dataset.json")) {
            foldersToCheck.push(`./${DATA_FOLDER_NAME}/${name}`);
          }
        } catch (error) {
          console.log(error);
        }
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
    })
    .catch(console.log);
};

validateDatasets();
