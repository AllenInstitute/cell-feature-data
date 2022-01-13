const fsPromises = require('fs').promises;

const map = require('lodash').map

const {
    TEMP_LOCAL_FILE_INFO_JSON
} = require("../constants");

const uploadCellCountsPerCellLine = async (readFolder, firebaseHandler, defaultGroupBy) => {
    console.log("uploading cell line counts... ")
    const data = await fsPromises.readFile(`${readFolder}/${TEMP_LOCAL_FILE_INFO_JSON}`);
    const json = JSON.parse(data);
    const counts = json.reduce((acc, ele) => {

        const groupBy = ele.groupBy;
        if (!acc[groupBy]) {
            acc[groupBy] = 0;
        }
        acc[groupBy]++;
        return acc;
    }, {})
    map(counts, (value, key) => {
        firebaseHandler.updateFeatureCount(defaultGroupBy, key, value)
    })
    console.log("uploading cell line counts complete ")

}

module.exports = uploadCellCountsPerCellLine