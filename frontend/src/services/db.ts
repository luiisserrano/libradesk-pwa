import localforage from 'localforage';

const db = localforage.createInstance({
    name: 'libradesk',
    storeName: 'books',
});

export default db;
