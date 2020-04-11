const staticCacheName = 'static-23';
const staticFiles = [
    './',
    './css/app.css',
    './index.html',
    './js/lib/idb.js',
    './js/lib/indexeddb.js',
    './js/bundle.js',
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
            if (thisCacheName !== staticCacheName) {

                console.log("deleting cache files from", thisCacheName)

                return caches.delete(thisCacheName);
            }

        }));
    }));
});


//hijacking requests
self.addEventListener('fetch', event => {

    event.respondWith(
        caches.match(event.request)
          .then(function (response) {
            if (response) {
              return response;
            } else {
              return fetch(event.request)
                .then(function (res) {
                  return caches.open(staticCacheName)
                    .then(function (cache) {
                      cache.put(event.request.url, res.clone());
                      return res;
                    })
                })
                .catch(function (err) {
                 console.log(err);
                });
            }
          })
    );

});

//Display push message
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const title = 'You havent recorded anything over 5 hours!!';
    const options = {
        body: 'Click to add an expense or income',
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

self.addEventListener('sync', function (event) {
    console.log('[Service Worker] Background syncing', event);
    if (event.tag === 'sync-new-posts') {
        console.log('[Service Worker] Syncing new Posts');
        event.waitUntil(
            readAllData('expenses-sync')
                .then(function (data) {
                    for (var dt of data) {
                        fetch('https://us-central1-money-paddy.cloudfunctions.net/syncExpenseData', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            },
                            body: JSON.stringify({
                                timestamp: Date.now(),
                                value: input.inputValue,
                                description: input.inputDescription
                            })
                        })
                            .then(function (res) {
                                console.log('Sent data', res);
                                if (res.ok) {
                                    res.json()
                                        .then(function (resData) {
                                            deleteData('expenses-sync', resData.id);
                                        });
                                }
                            })
                            .catch(function (err) {
                                console.log('Error while sending data', err);
                            });
                    }

                })
        );
    }
});