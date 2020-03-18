//Declring global variable for deffered prompt event.
let defferedPrompt;

self.addEventListener('install', (event) =>{
   console.log('[Service Worker] installing service worker ...', event);
   event.waitUntil(
       caches.open('static')
        .then(cache => {
           cache.add('')  
        })
   )
});

self.addEventListener('activate', (event) =>{
    console.log('[Service Worker] Activating service worker ...', event);
    return self.clients.cliam();
});

//Event listner to defer prompt event till user tries to add an expense or income
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    defferedPrompt = event;
    return false;
})