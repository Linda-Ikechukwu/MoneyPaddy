//For IndexedDB

//Create/Initialize our indexeddb databases
const dbPromise = idb.open('inputs', 2, (db) => {
    if (!db.objectStoreNames.contains('expense')) {
        db.createObjectStore('expense', { keyPath: 'id' });
        //db.createObjectStore('incomes', {keyPath: 'id'});
    }
    if (!db.objectStoreNames.contains('income')) {
        db.createObjectStore('income', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('expenses-sync')) {
        db.createObjectStore('expenses-sync', { keyPath: 'id' });
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

//Read All Data
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

//Delete one data entry instance
const deleteData = (obStore, id) => {
    return dbPromise
        .then(db => {
            const tx = db.transaction(obStore, 'readwrite');
            const store = tx.objectStore(obStore);
            store.delete(id);
            return tx.complete;
        })

}