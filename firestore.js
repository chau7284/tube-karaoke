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

exports.insert_silent = function (params) {
    params.field.time = admin.firestore.FieldValue.serverTimestamp();
    docRef = db.collection(params.collection).doc(params.document);
    docRef.set(
        params.field
    );
}

exports.insert = function (params, res) {
    params.field.time = admin.firestore.FieldValue.serverTimestamp();
    docRef = db.collection(params.collection).doc(params.document);
    docRef.set(
        params.field
    ).then(() => {
        res.send("OK");
        res.end();
    });
}

exports.gets = function (params, res) {
    let docRef = db.collection(params.collection)
    docRef.get()
        .then(snapshot => {
            var arr = [];
            snapshot.forEach(doc => {
                var d = {
                    document: doc.id,
                    field: doc.data()
                }
                arr.push(d);
            });

            res.json({
                collection: params.collection,
                data: arr
            });
            res.end();

        })
        .catch(err => {
            res.json({
                collection: params.collection,
                data: []
            });
            res.end();
        });
}

exports.get = function (params, res) {
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

exports.paging = function (params, res) {
    try {
        if (params.collection == null || params.collection === '') {
            res.json(
                {
                    collection: '',
                    data: [],
                }
            );
        } else {
            let docRef = db.collection(params.collection);
            if (params.order == null || params.order == "") {
                res.json(
                    {
                        collection: '',
                        data: [],
                    }
                );
            } else {
                if (params.where == null || params.where == "") {
                    if (params.order.next == null || params.order.next == "") {
                        console.log('PAGING-FIRST');
                        docRef.orderBy(params.order.field).limit(params.order.limit)
                            .get()
                            .then(snapshot => {
                                let d = snapshot.docs[snapshot.docs.length - 1];
                                let last = d.data()[params.order.field];
                                var arr = [];
                                snapshot.forEach(doc => {
                                    var d = {
                                        document: doc.id,
                                        field: doc.data(),
                                        next: last
                                    }
                                    arr.push(d);
                                });

                                res.json({
                                    collection: params.collection,
                                    data: arr
                                });
                            });
                    } else {
                        console.log('PAGING-NEXT');
                        docRef.orderBy(params.order.field).startAfter(params.order.next).limit(params.order.limit)
                            .get()
                            .then(snapshot => {
                                let d = snapshot.docs[snapshot.docs.length - 1];
                                let last = d.data()[params.order.field];

                                var arr = [];
                                snapshot.forEach(doc => {
                                    var d = {
                                        document: doc.id,
                                        field: doc.data(),
                                        next: last
                                    }
                                    arr.push(d);
                                });

                                res.json({
                                    collection: params.collection,
                                    data: arr
                                });
                            });
                    }
                } else {
                    if (params.order.next == null || params.order.next == "") {
                        console.log('PAGING-WHERE-FIRST');
                        docRef.where(params.where.field, params.where.condition, params.where.value).orderBy(params.order.field).limit(params.order.limit)
                            .get()
                            .then(snapshot => {
                                let d = snapshot.docs[snapshot.docs.length - 1];
                                let last = d.data()[params.order.field];
                                var arr = [];
                                snapshot.forEach(doc => {
                                    var d = {
                                        document: doc.id,
                                        field: doc.data(),
                                        next: last
                                    }
                                    arr.push(d);
                                });

                                res.json({
                                    collection: params.collection,
                                    data: arr
                                });
                            });
                    } else {
                        console.log('PAGING-WHERE-NEXT');
                        docRef.where(params.where.field, params.where.condition, params.where.value).orderBy(params.order.field).startAfter(params.order.next).limit(params.order.limit)
                            .get()
                            .then(snapshot => {
                                let d = snapshot.docs[snapshot.docs.length - 1];
                                let last = d.data()[params.order.field];

                                var arr = [];
                                snapshot.forEach(doc => {
                                    var d = {
                                        document: doc.id,
                                        field: doc.data(),
                                        next: last
                                    }
                                    arr.push(d);
                                });

                                res.json({
                                    collection: params.collection,
                                    data: arr
                                });
                            });
                    }
                }
            }
        }
    } catch (err) {
        res.send("OK");
        res.end();
    }
}

exports.updatenull = function(deviceName, videoId, key, error, reason){

    var current = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    var params = {
        "collection": "NULL",
        "document": key + "___"+ new Date().toISOString(),
        "field": {
            "deviceName": deviceName,
            "videoId": videoId,
            "key":key,
            "error": error,
            "reason": reason,
            "time": current
        }
    }

    params.field.time = admin.firestore.FieldValue.serverTimestamp();
    docRef = db.collection(params.collection).doc(params.document);
    docRef.set(
        params.field
    );
}

exports.setSchedule = function(version){
    console.log("Set-Schedule");
    var current = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    var params = {
        "collection": "SCHEDULE",
        "document": version,
        "field": {
            "ts": current
        }
    }

    params.field.time = admin.firestore.FieldValue.serverTimestamp();
    docRef = db.collection(params.collection).doc(params.document);
    docRef.set(
        params.field
    );
}

exports.getSChedule = async function(version){
    console.log("Get-Schedule");
    var params = {
        "collection": "SCHEDULE",
        "document": version,
    }
    return new Promise((resolve) => {
        let docRef = db.collection(params.collection).doc(params.document);
        docRef.get()
            .then(doc => {
                if (!doc.exists) {
                    console.log("OTHER");
                    resolve(true);
                } else {
                    console.log("SAME");
                    resolve(false);
                }
            })
            .catch(err => {
                resolve(false);
            });
    });
}

