//Variables for cache names
const CACHE_NAME = "url-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

//Files to add to cache
const FILES_TO_CACHE = [
  "/",
  "/index.js",
  "/manifest.webmanifest",
  "/offlineStorage.js",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

//Installs service worker
self.addEventListener("install", (event) => {
  //Promise to wait until all files are added to cache
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  //Skips waiting phase
  self.skipWaiting();
});

//Listens for fetch call
self.addEventListener("fetch", (event) => {
  //Triggers if fetch calls to api
  if (event.request.url.includes("/api/")) {
    //Opens a cache to store database data
    event.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          //Return a created clone of data stored into cache
          return (
            fetch(event.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(event.request.url, response.clone());
                }
                return response;
              })
              //If offline pulls data from cache
              .catch((err) => {
                return cache.match(event.request);
              })
          );
        })
        //Catch for error in promise
        .catch((err) => {
          console.log(err);
        })
    );
    return;
  }
  //Event if not calling api
  event.respondWith(
    //Looks to cache for route or fetches route if missing and online
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((response) => {
        return response || fetch(event.request);
      });
    })
  );
});

//Activate service worker
self.addEventListener("activate", (event) => {
  //Variable with current cache names
  const cacheAllowList = [CACHE_NAME, DATA_CACHE_NAME];
  //Promise to check that caches have latest versions.  Deletes any old versions.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowList.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  //Page immediately controlled by service worker.
  self.clients.claim();
});
