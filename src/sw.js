importScripts('./idb.js');

//For IndexedDB
//Open Data Base
const dbPromise = idb.open('inputs', 1, (db) => {
    if (!db.objectStoreNames.contains('expenses')) {
      db.createObjectStore('expenses', {keyPath: 'id'});
      //db.createObjectStore('incomes', {keyPath: 'id'});
    }
    if (!db.objectStoreNames.contains('incomes')) {
       db.createObjectStore('incomes', {keyPath: 'id'});
    }
});
  
//Write Data  
const writeData = (obStore, data) => {
    return dbPromise
      .then((db) => {
        const tx = db.transaction(obStore, 'readwrite');
        const store = tx.objectStore(obStore);
        store.put(data);
        return tx.complete;
    });
}
  
//Read Data
const readData = (obStore) => {
    return dbPromise
       .then(db => {
           const tx = db.transaction(obStore, 'readonly');
           const store = tx.objectStore(obStore);
           return store.getAll();
       })
}

//Clear Data
const clearDatabase = (obStore) => {
    return dbPromise
       .then(db => {
           const tx = db.transaction(obStore, 'readwrite');
           const store = tx.objectStore(obStore);
           store.clear();
           return tx.complete;
       })
}

const deleteData = (obStore, id) => {
    return dbPromise
       .then(db => {
           const tx = db.transaction(obStore, 'readwrite');
           const store = tx.objectStore(obStore);
           store.delete(id);
           return tx.complete;
       })
        
}

const staticCacheName = 'static-12';
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