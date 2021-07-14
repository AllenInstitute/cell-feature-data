const _ = require("lodash");

const initialize = (data, schemaObj) => {
    const out = {}
    _.forEach(schemaObj.properties, (attrs, property) => {
        if (data[property] && data[property] !== undefined) {
            out[property] = data[property];
            return;
        }
        switch (attrs.type) {
            case "string":
                out[property] = '';
                break;
            case "integer":
                out[property] = 0;
                break;
            case "number":
                out[property] = 0;
                break;
            case "boolean":
                out[property] = false;
                break;
        }
    })
    return out;

}
const validate = (data, schema) => {

    const valid = schema(data)
    const error = !valid ? schema.errors[0] : null;

    return {
        valid,
        error,
    }
}

module.exports = {
    initialize,
    validate
};