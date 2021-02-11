window.addEventListener("offline", () => {
  const deleteRequest = indexedDB.deleteDatabase("OfflineBudget");
  deleteRequest.onsuccess = (event) => {
    console.log("Deleted");
  };
});

function saveRecord(data) {
  if (!navigator.onLine) {
    const request = indexedDB.open("OfflineBudget", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      const objectStore = db.createObjectStore("offlineTransactions", {
        autoIncrement: true,
      });
      objectStore.createIndex("name", "name", { unique: false });
      objectStore.createIndex("value", "value", { unique: false });
      objectStore.createIndex("date", "date", { unique: true });
    };
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["offlineTransactions"], "readwrite");
      const objectStore = transaction.objectStore("offlineTransactions");
      const addRequest = objectStore.add(data);
      addRequest.onsuccess = (event) => {};
    };
  }
}

window.addEventListener("online", () => {
  location.reload();
  const request = indexedDB.open("OfflineBudget");
  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(["offlineTransactions"], "readonly");
    const objectStore = transaction.objectStore("offlineTransactions");
    const pullRequest = objectStore.getAll();
    pullRequest.onsuccess = (event) => {
      const data = event.target.result;
      fetch("/api/transaction/bulk", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => {
        return res.json();
      });
    };
  };
});
