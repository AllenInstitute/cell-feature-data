const functions = require('firebase-functions');
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');

const app = admin.initializeApp();
const db = app.firestore();
const firestoreRef = db.collection('cfe-datasets').doc('v1_1');

exports.incrementTotalCellCountForCellLine = functions.firestore
    .document('cfe-datasets/v1_1/cell-feature-analysis/{cellId}').onCreate((snap, context) => {
        const newValue = snap.data();
        // access a particular field as you would any JS property
        const fileInfo = newValue.file_info;
        
        const cellLine = fileInfo.CellLineName;
        console.log('adding new to ', cellLine)
        const ref = firestoreRef.collection('cell-line-def').doc(cellLine)
        const increment = admin.firestore.FieldValue.increment(1);
        ref.update({
            cellCount: increment
        })
    });