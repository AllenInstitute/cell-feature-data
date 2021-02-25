const fsPromises = require('fs').promises;
const {
    mapKeys
} = require('lodash');

const {
    CELL_LINE_DEF_NAME_KEY
} = require("../constants");

const formatCellLineDefs = (readFolder, cellLineDefFileName) => (
    fsPromises.readFile(`${readFolder}/${cellLineDefFileName}`)
    .then((data) => JSON.parse(data))
    .then((json) => json.map((ele) => mapKeys(ele, (value, key) => key.replace('/', '_'))))
)

const uploadCellLines = async (firebaseHandler, readFolder, cellLineDefFileName) => {
    console.log("uploading cell lines..." )
    const json = await formatCellLineDefs(readFolder, cellLineDefFileName)

    await firebaseHandler.uploadArrayUsingKeys(json, firebaseHandler.cellLineDefEndpoint, CELL_LINE_DEF_NAME_KEY)
    console.log("uploading cell lines complete")
    return json;
}

module.exports = uploadCellLines;