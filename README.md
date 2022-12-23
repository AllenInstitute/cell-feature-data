# Contributing: 
Clone or fork this repo
run `npm i`


### Needed in .env file:
```
NODE_ENV="production"
# used if NODE_ENV === "production"
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_DB_URL=
FIREBASE_ID=
STORAGE_BUCKET=
MESSAGING_SENDER_ID=
FIREBASE_TOKEN=
FIREBASE_EMAIL=

# used if NODE_ENV !== "production"
TESTING_FIREBASE_API_KEY=
TESTING_FIREBASE_AUTH_DOMAIN=
TESTING_FIREBASE_DB_URL=
TESTING_FIREBASE_ID=
TESTING_STORAGE_BUCKET=
TESTING_MESSAGING_SENDER_ID=
TESTING_FIREBASE_TOKEN=
TESTING_FIREBASE_EMAIL=

AWS_SECRET=
AWS_ID=
```
# To process a dataset:

## Setup
### Expected files in a dataset directory:
- `dataset.json`: a json file with metadata about the dataset and the names of the other files, using the keys listed below
- featureDefsPath: path to a json describing the measured features in this dataset, *the order of this document has to match the order of the values in the `featuresData` file. Also if no displayOrder is given it will be used as the display order on the website. *
- featuresDataPath: path to a json listing the per cell data
- viewerSettingsPath: path to a json with settings for volume data channels in the 3d viewer
For more on what these files should look like, look at `process-dataset/data-validation/schema.js`

## To run process:
`node process-dataset [PATH/TO/DATASET]`
or
`npm run process-dataset [PATH/TO/DATASET]`

To skip the fileInfo upload but run all the other steps (fileInfo upload takes a long time because firebase limits to 500 uploads per request):

`node process-dataset [PATH/TO/DATASET] true`

## Upload a dataset card image after the data has been uploaded
`npm run upload-image [PATH/TO/DATASET]`

## Release dataset to production
`npm run release-dataset [MEGASET_NAME]` // will release every dataset in a megaset. Note, this isn't the folder name, it's the megaset name
`npm run release-dataset [DATASET_ID]` // will release a dataset that isn't part of a megaset, id should be in the format `[NAME]_v[VERSION]`
`npm run release-dataset [MEGASET_NAME]  [DATASET_ID]` // will a dataset contained within a megaset, id should be in the format `[NAME]_v[VERSION]`

