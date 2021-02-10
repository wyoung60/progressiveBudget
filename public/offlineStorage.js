window.addEventListener("offline", () => {
  let transactionNumber = 1;
  const request = indexedDB.open("OfflineBudget");
  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const objectStore = db.createObjectStore("offlineTransactions", {
      keyPath: "id",
    });
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("value", "value", { unique: false });
    objectStore.transaction.oncomplete = (event) => {
      const addButton = document.querySelector("#add-btn");
      addButton.addEventListener("click", () => {
        const transactionData = {};
        transactionData.id = transactionNumber;
        transactionData.name = document.querySelector("#t-name").value;
        transactionData.value = document.querySelector("#t-amount").value;
        const transaction = db
          .transaction("offlineTransactions", "readwrite")
          .objectStore("offlineTransactions");
        transaction.add(transactionData);
        transactionNumber++;
      });
    };
  };
});

window.addEventListener("online", () => {
  const request = indexedDB.deleteDatabase("OfflineBudget");
});
