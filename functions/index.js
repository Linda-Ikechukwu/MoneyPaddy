const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const serviceAccount = require("./credentials.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://money-paddy.firebaseio.com"
});



//exports.sendPushNotifications = functions.database.ref('/inputs/Expenses').orderByChild('timestamp').limitToLast(1).once('value', (snapshot) => {
    //if((Date.now() - snapshot.val().timestamp) > 720000){}
//})

exports.sendPushNotifications = functions.https.onRequest((request, response) => {
    cors(request, response, function(){
        admin.database.ref('/inputs/Expenses').orderByChild('timestamp').limitToLast(1)
        .then(() => {
            if(response && ((Date.now() - response.body.timestamp) > 72000000 )){
               webpush.setVapidDetails('mailto:lindaedwin96@gmail.com',
                                       'BLdBmQJEKbyXDuvqA8b7IBXP7VhUCtqiRIibpdleNHiEaxNl_V-VLQbm-w2WghKEWiEMQsSwX4ssAt5pxEB9ZzU', 
                                       '5XBYj4-ofbbkMhSI022pKeYQcuuCqZ1ijqLqvBGp-Ls');
                return admin.database.ref('/subscriptions').once('value');
            }
        }) 
        .then(subscriptions => {
            if(! subscriptions.val()) return

            subscriptions.forEach( sub => {
                let config = {
                    endpoint: sub.val().endpoint,
                    keys:{
                        auth: sub.val().keys.auth,
                        p256dh: sub.val().keys.p256dh
                    }
                }
                webpush.sendNotification(config, JSON.stringify({
                    title:'You have not added an expense in over 5 hours',
                    body: 'Click to record your expenses now!'
                }))
            })
        })
        .catch(function(err) {
            response.status(500).json({error: err});
        });
    })
});


exports.syncExpenseData = functions.https.onRequest(function(request, response) {
    cors(request, response, function() {
      admin.database().ref('posts').push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image
      })
        .then(function() {
          response.status(201).json({message: 'Data stored', id: request.body.id});
        })
        .catch(function(err) {
          response.status(500).json({error: err});
        });
    });
   });
   