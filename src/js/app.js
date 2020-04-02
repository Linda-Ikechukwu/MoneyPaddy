
//Store values in database so theyre not lost on reload;
//Make it PWA
//if its the end of a month, remove income and expenses from the UI, store it and reset it.
//importing css for webpack
import '../css/app.css';
import { appController } from './controller';
import { domElements } from './base';

//Initializing the app
appController.init();

//Initializing the notifications choice
function initializeNotificationsRadio() {
    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            isSubscribed = !(subscription === null);

            if (isSubscribed) {
                domElements.notifyYes.disabled = true;
                domElements.notifyNo.disabled = true;
            } else {
                domElements.notifyYes.disabled = false;
                domElements.notifyNo.disabled = false;
            }

        });
}

//Registering the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then((swreg) => {
            swRegistration = swreg;
            initializeNotificationsRadio();
            console.log('sevice worker registered');
        })
        .catch(function(error) {
            console.error('Service Worker Error', error);
        });
}



//Dummy fetch
fetch('https://money-paddy.firebaseio.com/inputs/Expenses.json')
    .then(function (res) {
        console.log(res.json());
    })





