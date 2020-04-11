
//Implemet a page for the total income and total expense ish

//importing css for webpack
import '../css/app.css';
import { appController } from './controller';
import { domElements } from './base';

if (!window.indexedDB) {
    alert('This app will not work properly on your browser as it doesnt support indexeddb');
}

//Initializing the app
appController.init();

let swRegistration;

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


//Initializing the notifications choice
function initializeNotificationsRadio() {
    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then((subscription) => {
           let isSubscribed = !(subscription === null);

            if (isSubscribed) {
                domElements.notifyYes.disabled = true;
                domElements.notifyNo.disabled = true;
            } else {
                domElements.notifyYes.disabled = false;
                domElements.notifyNo.disabled = false;
            }

        });
}










