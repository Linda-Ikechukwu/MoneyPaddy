
//Store values in database so theyre not lost on reload;
//Make it PWA
//if its the end of a month, remove income and expenses from the UI, store it and reset it.

//importing css for webpack
import '../css/app.css'
import {budgetController} from './controller';

//Initializing the app
budgetController.init();

//Checking if service workers are available
if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js')
    .then( () => {
        console.log('sevice worker registered');
    });
}








