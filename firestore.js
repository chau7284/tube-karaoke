const admin = require('firebase-admin');
const serviceAccount = require('./tube-karaoke-c8df9-firebase-adminsdk-e06am-31b9cb58d0.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tube-karaoke-c8df9.firebaseio.com'
});
let db = admin.firestore();

exports.set_ = function(params, res){
    
}