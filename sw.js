// self.addEventListener("fetch", (event)=>console.log("event.request"))
// self.addEventListener("fetch", (event)=>{
//   event.respondWith (
//     new Response("Hello there", {
//       headers: {'Content-Type':'text/html'}
//     })
//   )
// })

// self.addEventListener("fetch", (event)=>{
//   if (event.request.url.endsWith('.jpg')){
//   event.respondWith (
//     fetch('https://www.law.com/image/EM/NLJ/dr-evil-Article-201705151745.jpg')
//   )
// }
// }) // gives CORS error

// self.addEventListener('fetch', event=> event.respondWith(
//   fetch(event.request).then(response=>{
//     if (response.status ===404 ){
//       return new Response("404: The page was not found")
//     }
//       return response;
//   }).catch(()=>{
//     return new Response("Unable to connect to the server")
//   })
// ))

// self.addEventListener('fetch', event=> event.respondWith(
//   fetch(event.request).then(response=>{
//     if (response.status ===404 ){
//       return fetch('https://www.law.com/image/EM/NLJ/dr-evil-Article-201705151745.jpg')
//     }
//       return response;
//   }).catch(()=>{
//     return new Response("Unable to connect to the server")
//   })
// ))

// source : https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

// importScripts('node_modules/idb/lib/idb.js');

self.addEventListener("fetch", function(event) {
  // don't cache the data received from the API call but store them to the indexDb
  if (!event.request.url.includes("localhost:1337")){
  event.respondWith(
    caches.open("restaurants-static-v2").then(function(cache) {
      return cache.match(event.request).then(function(response) {
        return (
          response ||
          fetch(event.request).then(function(response) {
            cache.put(event.request, response.clone());
            return response;
          })
        );
      });
    })
  )} 
});
