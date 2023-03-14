[![Dataset validation](https://github.com/allen-cell-animated/cell-feature-data/actions/workflows/validate.yml/badge.svg?branch=main)](https://github.com/allen-cell-animated/cell-feature-data/actions/workflows/validate.yml)

# Contributing: 
Clone or fork this repo
run `npm i`

## Setup
### A glance of cloud firestore  
- [documentation + tutorial](https://firebase.google.com/docs/firestore) 
- [get started](https://firebase.google.com/docs/firestore/quickstart)
  
### Set up a dev database
- choose Test mode in your security rules 
- add your required secret tokens to .env file 
- set NODE_ENV="dev" in .env file
> Please refer to the `Needed in .env file` section for obtaining tokens  

### Three database options:
- `dev`: developer's personal testing database, the default option for development. Create your own credentials to access. 
- `staging`: group testing || for scientists to review 
- `production`: group production 

### Needed in .env file:
```
NODE_ENV= "production" || "staging" || "dev"
AWS_SECRET=
AWS_ID=

# used if NODE_ENV === "production"
FIREBASE_TOKEN=
FIREBASE_EMAIL=

# used if NODE_ENV === "staging"
STAGING_FIREBASE_TOKEN= 
STAGING_FIREBASE_EMAIL=

# used if NODE_ENV === "dev"
DEV_FIREBASE_TOKEN= project settings/service accounts/generate new private key
DEV_FIREBASE_ID= project settings/general/project ID
DEV_FIREBASE_EMAIL= project settings/services accounts/firebase service account 
```
> To access `AWS`, `production`, or `staging`, please contact the development team for the necessary credentials 

# To process a dataset:

## Expected files in a dataset directory:
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
or 
`npm run process-dataset [PATH/TO/DATASET] true`

## Upload a dataset card image after the data has been uploaded
`npm run upload-image [PATH/TO/DATASET]`

## Release dataset to production
`npm run release-dataset [MEGASET_NAME]` // will release every dataset in a megaset. Note, this isn't the folder name, it's the megaset name
`npm run release-dataset [DATASET_ID]` // will release a dataset that isn't part of a megaset, id should be in the format `[NAME]_v[VERSION]`
`npm run release-dataset [MEGASET_NAME]  [DATASET_ID]` // will a dataset contained within a megaset, id should be in the format `[NAME]_v[VERSION]`

