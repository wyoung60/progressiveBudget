//Declare db variable for global use to create mulitiple transactions off of.
let db;

//Open/create indexDB database named OfflineBudget
const request = indexedDB.open("OfflineBudget", 1);
//Creates object store in database when intially created or updated
request.onupgradeneeded = (event) => {
  //Targets database
  const db = event.target.result;
  //Creates object store in database with key value
  const objectStore = db.createObjectStore("offlineTransactions", {
    autoIncrement: true,
  });
  //Creates an index for all parts of object incase need to reference specific value
  objectStore.createIndex("name", "name", { unique: false });
  objectStore.createIndex("value", "value", { unique: false });
  objectStore.createIndex("date", "date", { unique: true });
};
//If database is successfully accessed stores to database variable to use later.
request.onsuccess = (event) => {
  db = event.target.result;
};

//Function called in index.js for offline transactions
function saveRecord(data) {
  //Accesses object store in readwrite mode
  const transaction = db.transaction(["offlineTransactions"], "readwrite");
  //Accesses object store off of transaction variable to allow modifications
  const objectStore = transaction.objectStore("offlineTransactions");
  //Adds data to object store
  const addRequest = objectStore.add(data);
}

//Listens for connection to come back online.
window.addEventListener("online", () => {
  //Accesses object store same as above.
  const transaction = db.transaction(["offlineTransactions"], "readwrite");
  const objectStore = transaction.objectStore("offlineTransactions");
  //Gets all data from object store and store to variable
  const pullRequest = objectStore.getAll();
  //Erases object store data once stored
  objectStore.clear();
  //If data is pulled successfully triggers callback
  pullRequest.onsuccess = (event) => {
    //Gets array of data
    const data = event.target.result;
    //Fetch to api to post data in database
    fetch("/api/transaction/bulk", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => {
      res.json();
    });
  };
});
