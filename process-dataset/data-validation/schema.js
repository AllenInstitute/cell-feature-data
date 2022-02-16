const Ajv = require("ajv").default
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

const datasetSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "datasetSchema",
    "title": "Dataset",
    "description": "Data needed to render a dataset card",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "title": {
            "description": "Display name of the dataset",
            "type": "string"
        },
        "name": {
            "description": "Name of the dataset (no version number)",
            "type": "string"
        },
        "version": {
            "description": "version year and number",
            "type": "string",
        },
        "description": {
            "description": "Description of the dataset",
            "type": "string",
        },
        "dateCreated": {
            "description": "Date the dataset was created in 'm d, YYYY' (not necessarily the most recent version)",
            "type": "string",
        },
        "image": {
            "description": "Url to image src",
            "type": "string",
        },
        "link": {
            "description": "Link to website displaying the dataset",
            "type": "string",
        },
        "userData": {
            "description": "Optional display data",
            "type": "object",
        },
        "production": {
            "description": "Whether this dataset should only be shown in production",
            "type": "boolean",
        }
    },
    "required": [
        "title",
        "version",
        "name",
        "image",
        "description",

    ],
}

const manifestSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "manifestSchema",
    "title": "Manifest",
    "description": "High level for each dataset",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "featuresDataPath": {
            "description": "url to the per cell data json",
            "type": "string"
        },
        "cellLineDataPath": {
            "description": "collection name of the cell line data",
            "type": "string",
        },
        "featureDefsPath": {
            "description": "path to the feature def collection",
            "type": "string",
        },
        "viewerSettingsPath": {
            "description": "path to image per-channel settings for the 3d viewer",
            "type": "string",
        },
        "albumPath": {
            "description": "collection name of the album data",
            "type": "string",
        },
        "thumbnailRoot": {
            "description": "Root url for thumbnail images",
            "type": "string",
        },
        "downloadRoot": {
            "description": "Root url for downloading cell data",
            "type": "string",
        },
        "volumeViewerDataRoot": {
            "description": "Root url for 3d images",
            "type": "string",
        },
        "xAxis": {
            "description": "Settings for the x axis",
            "type": "object",
            "properties": {
                "default": {
                    "description": "Default feature key for the axis",
                    "type": "string",
                },
                "exclude": {
                    "description": "Optional list of feature keys to exclude",
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            }
        },
        "yAxis": {
            "description": "Settings for the y axis",
            "type": "object",
            "properties": {
                "default": {
                    "description": "Default feature key for the axis",
                    "type": "string",
                },
                "exclude": {
                    "description": "Optional list of feature keys to exclude",
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            }
        },
        "colorBy": {
            "description": "Settings for the color by menu",
            "type": "object",
            "properties": {
                "default": {
                    "description": "Default feature key to color the data by",
                    "type": "string",
                },
                "exclude": {
                    "description": "Optional list of feature keys to exclude",
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            }
        },
        "groupBy": {
            "description": "Settings for the grouping menu",
            "type": "object",
            "properties": {
                "default": {
                    "description": "Default feature key for the group menu",
                    "type": "string",
                },
                "exclude": {
                    "description": "Optional list of feature keys to exclude",
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            }
        },
        "featuresDisplayOrder": {
            "description": "Ordered array of feature keys for display on front end",
            "type": "array",
        },
        "featuresDataOrder": {
            "description": "Ordered array of feature keys for packing and unpacking data",
            "type": "array",
        },
    },
    "required": [
        "featuresDataPath",
        "cellLineDataPath",
        "viewerSettingsPath",
        "albumPath",
        "thumbnailRoot",
        "downloadRoot",
        "volumeViewerDataRoot",
        "xAxis",
        "yAxis",
        "groupBy",
        "colorBy",
        "featuresDisplayOrder",
        "featuresDataOrder"
    ],
}

const featureDefSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "featureDefSchema",
    "title": "Feature Defs",
    "description": "Measured features in the dataset",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "displayName": {
            "description": "Human readable name",
            "type": "string"
        },
        "description": {
            "description": "Description of how the data was collected/measured",
            "type": "string",
        },
        "tooltip": {
            "description": "Shorter version of description",
            "type": "string",
        },
        "unit": {
            "description": "unit of measurement",
            "type": "string",
        },
        "key": {
            "description": "Id of the feature",
            "type": "string",
        },
        "discrete": {
            "description": "Whether it's a continuous measurement or not",
            "type": "boolean",
        },
        "options": {
            "description": "For discrete features, display items for each value",
            "type": "object",
        }
    },
    "required": [
        "displayName",
        "description",
        "tooltip",
        "unit",
        "key",
        "discrete",
    ],
}

const fileInfoSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "fileInfoSchema",
    "title": "File Info",
    "description": "Metadata per cell",
    "type": "array",
    "items": {
        "additionalProperties": false,
        "type": "object",
        "properties": {
            "CellId": {
                "description": "unique id for segmented cell",
                "type": ["number", "string"]
            },
            "FOVId": {
                "description": "Field of view cell came from",
                "type": ["number", "string"]
            },
            "groupBy": {
                "description": "Id of feature the data is grouped by by default",
                "type": "string",
            },
            "thumbnailPath": {
                "description": "Path to thumbnail image for cell",
                "type": "string",
            },
            "volumeviewerPath": {
                "description": "path to 3d data for cell",
                "type": "string",
            },
            "fovThumbnailPath": {
                "description": "Path to fov thumbnail",
                "type": "string",
            },
            "fovVolumeviewerPath": {
                "description": "Path to the fov 3d data",
                "type": "string",
            },

        },
        "required": [
            "CellId",
            "FOVId",
            "groupBy",
            "volumeviewerPath",
        ],
    }
}

const measuredFeaturesDocSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": "measuredFeaturesSchema",
    "title": "Measured features",
    "description": "Data per cell needed to create the CFE plot",
    "type": "object",
    "type": "array",
    "items": {
        "additionalProperties": false,
        "type": "object",
        "properties": {
            "f": {
                "description": "ordered array of measured features",
                "type": "array",
                "items": {
                    "type": "number"
                }
            },
            "p": {
                "description": "Protein name",
                "type": "string",
            },
            "t": {
                "description": "Thumbnail Path",
                "type": "string",
            },


        },
        "required": [
            "f",
            "p",
            "t",
        ]
    }

}

module.exports = {
    datasetSchema: datasetSchema,
    manifestSchema: manifestSchema,
    featureDefSchema: featureDefSchema,
    fileInfoSchema: fileInfoSchema,
    dataset: ajv.compile(datasetSchema),
    manifest: ajv.compile(manifestSchema),
    featureDef: ajv.compile(featureDefSchema),
    fileInfo: ajv.compile(fileInfoSchema),
    measuredFeaturesDoc: ajv.compile(measuredFeaturesDocSchema)
}