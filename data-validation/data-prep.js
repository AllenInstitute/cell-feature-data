const _ = require("lodash");

const validate = (data, schema) => {
    let dataCopy;
    if (data.length !== undefined) {
        dataCopy = [...data]
    } else {
        dataCopy = {...data}
    }
    const valid = schema(dataCopy)
    const error = !valid ? schema.errors[0] : null;

    return {
        data: dataCopy,
        valid,
        error,
    }
}

module.exports = {
    validate
};