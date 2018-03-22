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

self.addEventListener('fetch', event=>{
  if (event.request.url.endsWith('.jpg')){
    fetch(event.request).then(response=>{
      // if (!response.ok)
      caches.open('restaurants-static-v1').then(cache=>{
        cache.add(event.request.url, response)
      })
    })
  }
})
