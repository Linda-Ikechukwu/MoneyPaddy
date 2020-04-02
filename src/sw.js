importScripts('./lib/idb.js');
importScripts('./lib/idb-utility.js');

const staticCacheName = 'static-12';
const dynamicCacheName = 'dynamic-1';
const staticFiles = [
    './',
    './js/bundle.js',
    './lib/idb.js',
    './lib/idb-utility.js',
    './css/app.css',
    './app.html',
    './idb.js',
    'https://fonts.googleapis.com/css?family=Josefin+Sans:400,600,700|Josefin+Slab&display=swap',
]

self.addEventListener('install', event => {
    console.log("service worker installed");
    event.waitUntil(
        caches.open(staticCacheName).then(cache => {
            cache.addAll(staticFiles);
        })
    );
});


//deleting cache and updating service workers
self.addEventListener('activate', event => {

    console.log("service worker activated");

    event.waitUntil(caches.keys().then(cacheNames => {
        Promise.all(cacheNames.map(thisCacheName => {
            if (thisCacheName !== (staticCacheName || dynamicCacheName)) {

                console.log("deleting cache files from", thisCacheName)

                return caches.delete(thisCacheName);
            }

        }));
    }));
});


//hijacking requests
self.addEventListener('fetch', event => {
    var url = 'https://money-paddy.firebaseio.com/inputs/Expenses';
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(fetch(event.request)
            .then( (res) => {
                let clonedRes = res.clone();
                clearDatabase('expenses')
                   .then( () => {
                      return clonedRes.json();
                    })
                    .then( (data) =>{
                        for (let key in data) {
                            writeData('expenses', data[key]);
                        }
                    })
                
                return res;
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }

                    //  Clone the request. 
                    return fetch(event.request.clone()).then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        let responseClone = response.clone();
                        // Clone the response
                        caches.open(dynamicCacheName)
                            .then(function (cache) {
                                cache.put(event.request, responseClone);
                            });

                        return response;
                    }
                    );
                })
        );
    }

});

//Display push message
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);
  
    const title = 'You havent recorded anything in 20 hours!!';
    const options = {
      body: 'Click to input an expense or income',
      icon: './icons/96.png',
      badge: './icons/96.png',
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
});

//Open app or new window on notification click
self.addEventListener('notificationclick', event => {
    const rootUrl = new URL('/', location).href;
    event.notification.close();
    // Enumerate windows, and call window.focus(), or open a new one.
    event.waitUntil(
      clients.matchAll().then(matchedClients => {
        for (let client of matchedClients) {
          if (client.url === rootUrl) {
            return client.focus();
          }
        }
        return clients.openWindow(rootUrl)
        .then(client => client.focus());
      })
    );
});