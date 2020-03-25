importScripts('./idb.js');

//For IndexedDB
//Open Data Base
const dbPromise = idb.open('posts-store', 1, function (db) {
    if (!db.objectStoreNames.contains('posts')) {
      db.createObjectStore('posts', {keyPath: 'id'});
    }
});
  
//Write Data  
const writeData = (st, data) => {
    return dbPromise
      .then((db) => {
        var tx = db.transaction(st, 'readwrite');
        var store = tx.objectStore(st);
        store.put(data);
        return tx.complete;
    });
}
  

const staticCacheName = 'static-6';
const dynamicCacheName = 'dynamic-1';
const staticFiles = [
    './',
    './js/bundle.js',
    './css/app.css',
    './app.html',
    './idb.js',
    'https://fonts.googleapis.com/css?family=Josefin+Sans:400,600,700|Josefin+Slab&display=swap',
]

self.addEventListener('install', event => {
    console.log("service worker installed");
    event.waitUntil(
        caches.open(staticFilesCache).then(cache => {
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
    var url = 'https://pwagram-99adf.firebaseio.com/posts';
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(fetch(event.request)
            .then( (res) => {
                var clonedRes = res.clone();
                clonedRes.json()
                    .then( (data) =>{
                        for (let key in data) {
                            writeData('posts', data[key]);
                        }
                    });
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

                        // Clone the response
                        caches.open(staticCacheName)
                            .then(function (cache) {
                                cache.put(event.request, response.clone());
                            });

                        return response;
                    }
                    );
                })
        );
    }

});