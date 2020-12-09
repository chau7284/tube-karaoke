const admin = require('firebase-admin');
const serviceAccount = require('./tube-karaoke-c8df9-firebase-adminsdk-e06am-31b9cb58d0.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tube-karaoke-c8df9.firebaseio.com'
});
let db = admin.firestore();

//var params = {
//    "collection": "tubesuber",
//    "document": ip,
//    "field": {
//        "url": url,
//        "lang": language,
//        "ip": ip,
//        "date": current
//    }
//}

exports.insert_silent = function(params){
    params.field.time = admin.firestore.FieldValue.serverTimestamp();
    docRef = db.collection(params.collection).doc(params.document);
    docRef.set(
        params.field
    );
}

exports.insert = function(params, res){
    params.field.time = admin.firestore.FieldValue.serverTimestamp();
    docRef = db.collection(params.collection).doc(params.document);
    docRef.set(
        params.field
    ).then(() =>{
        res.send("OK");
        res.end();
    });
}

exports.get = function(params, res){
    let docRef = db.collection(params.collection).doc(params.document);
    docRef.get()
        .then(doc => {
            if (!doc.exists) {
                res.json({
                    collection: params.collection,
                    data: []
                });
                res.end();
            } else {
                res.json({
                    collection: params.collection,
                    data: [
                        {
                            document: doc.id,
                            field: doc.data()
                        }
                    ]
                });
                res.end();

                db.collection(params.collection).doc(params.document).update(params.field);
            }
        })
        .catch(err => {
            res.json({
                collection: params.collection,
                data: []
            });
            res.end();
        });
}

