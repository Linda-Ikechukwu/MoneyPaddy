//Declring global variable for deffered prompt event.
let defferedPrompt;
const staticCacheName = 'static-1';
const dynamicCacheName = 'dynamic-1';

const trimCache = (cacheName, maxItems) => {
   caches.open(cacheName)
   .then(function(cache){
       return cache.keys()
          .then(keys => {
            if(keys.length > maxItems){
               cache.delete(keys[0])
                   .then(trimCache(cacheName, maxItems));
            }
        });
    })
   
}

self.addEventListener('install', (event) =>{
   console.log('[Service Worker] installing service worker ...', event);
   event.waitUntil(
       caches.open('static-1')
        .then(cache => {
           cache.addAll([
               './',
               './js/bundle.js',
               './css/app.css',
               './app.html',
               'https://fonts.googleapis.com/css?family=Josefin+Sans:400,600,700|Josefin+Slab&display=swap'
            ])  
        })
   )
});

self.addEventListener('activate', (event) =>{
    console.log('[Service Worker] Activating service worker ...', event);
    event.waitUntil(
       caches.keys()
         .then(keyList => {
            return Promise.all(keyList.map(key =>{
                if (key !== staticCacheName && key !== dynamicCacheName){
                    console.log('Removing old cache record', key)
                    return caches.delete(key)
                }
            }))
         })
    );
    return self.clients.cliam();
});

//Using fetch to hijack requests
self.addEventListener('fetch', (event) =>{
   event.respondWith(
       caches.match(event.request)
          .then(response => {   
              if (response){
                  return response;
              }else {
                  return fetch(event.request)
                    .then( res => {
                        return caches.open(dynamicCacheName)
                           .then( cache => {
                               cache.put(event.request.url, res.clone());
                               return res;
                           })
                    }).catch( err => {
                        //Add fallback route here. Like offline 404.
                    })
              }
          })
   );
});

//Event listner to defer prompt event till user tries to add an expense or income
window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    defferedPrompt = event;
    return false;
})