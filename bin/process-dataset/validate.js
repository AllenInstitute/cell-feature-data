// Usage:
// validate schemaname jsonfilename
// example:
// validate images dataset-2-1/images.json
// "schema" is one of the from data-validation/full-schema:
// - dataset
// - manifest
// - featureDef
// - fileInfo
// - measuredFeaturesDoc
// - images

const { readFileSync } = require("fs");
const dataPrep = require("../../../data-validation/data-prep");
const schemas = require("../../../data-validation/full-schema");

const args = process.argv.slice(2);
console.log("Received: ", args);

const schema = args[0];
const file = args[1];

const filecontents = readFileSync(file);
const jsonobj = JSON.parse(filecontents);

// will remove additional properties
const { data, valid, error } = dataPrep.validate(jsonobj, schemas[schema]);

if (!valid) {
  console.log("failed validation", error);
  process.exit(1);
} else {
  console.log("passed validation");
}
