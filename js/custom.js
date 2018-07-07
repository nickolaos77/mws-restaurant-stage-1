var dbPromise = idb.open("restaurantReviewsDb",1, function(upgradeDb){
    upgradeDb.createObjectStore('restaurantReviews', {keyPath: 'review_id'}) 
  });
  let review;
  let review_id = 0;
  // add a review
  
  // function postReview(url, review){
  
  // }

  
  const addReview = document.forms["add-review"];
  addReview.addEventListener("submit", function(e) {
      e.preventDefault()
      console.log(e);
      const userName = addReview.querySelector('#user_name').value;
      const userReview = addReview.querySelector('#user_review').value; 
      console.log("userName", userName);
      console.log("userReview", userReview);
      const url = 'http://localhost:1337/reviews/';
      review = {    
      'restaurant_id':  parseInt(window.location.search.slice(4)),
      'name': userName,
      'rating': addReview.querySelector('#rating').value,
      'comments': userReview
  };
      fetch(url, {
          method: 'POST', // or 'PUT'
          body: JSON.stringify(review), // data can be `string` or {object}!
          headers:{
          'Content-Type': 'application/json'
          }
      }).then(res => res.json())
      .catch(error => {
          // On network error  
          console.log("network error");
          
           return dbPromise.then(function(db){
              var tx = db.transaction('restaurantReviews');
              var restaurantsReviewsStore = tx.objectStore('restaurantReviews');
              return restaurantsReviewsStore.getAll();
            })
            .then (restaurantReviews=>{ 
                console.log(restaurantReviews);
                
               const storedReviews=restaurantReviews.length;// count how many reviews are already stored
                dbPromise.then(function(db){// and add the new review incrementing the id
                    console.log("THE DATABASE", db)
                   var tx = db.transaction('restaurantReviews', 'readwrite');
                   var restaurantsReviewsStore = tx.objectStore('restaurantReviews');
                   console.log('restaurantsReviewsStore', restaurantsReviewsStore);
                   
                   var reviewWithId = Object.assign(review,{"review_id":1 + storedReviews})
                   console.log('reviewWithId', reviewWithId);
                   
                    restaurantsReviewsStore.put(reviewWithId)
                    ;
                   return tx.complete.then(  ()=>console.log("transaction completed")).catch(error=>console.log(error));
                   
                  })
              })
      })
      .then(response => {
          console.log('Success:', response);
          addReview.reset(); //reset form
      }  );    
  });
  
  // when we get back online collect the reviews and post them
  window.addEventListener("online", function(event){
      console.log("You are now back online.", event);
      dbPromise.then(function(db){
          var tx = db.transaction('restaurantReviews');
          var restaurantsReviewsStore = tx.objectStore('restaurantReviews');
          return restaurantsReviewsStore.getAll();
        }).then(restaurantReviews=>{
            //console.log("restaurantReviews",restaurantReviews)
            restaurantReviews.forEach(restaurantReview=>
              {
                  const url = 'http://localhost:1337/reviews/';
                  fetch(url, {
                      method: 'POST', // or 'PUT'
                      body: JSON.stringify(restaurantReview), // data can be `string` or {object}!
                      headers:{
                      'Content-Type': 'application/json'
                      }
                  }).then(res => res.json())
                  // delete the review from the idb
                  .then( ()=> {
                      dbPromise.then(function(db){
                          var tx = db.transaction('restaurantReviews', 'readwrite');
                          tx.objectStore('restaurantReviews').delete(restaurantReview.review_id);
                        })
                  }
                  )
              }
          )
      })
  });
  
  
  
  
  const starButton = document.querySelector('#star');
  
  let favoriteRestaurantsIds=[];
  document.addEventListener('DOMContentLoaded', function() {
      fetch("http://localhost:1337/restaurants/?is_favorite=true")
      .then(res=>res.json())
      .then(res=>{
          favoriteRestaurantsIds = res.map(restaurant=>restaurant.id)
          console.log("Logging the Response",favoriteRestaurantsIds)
          if (favoriteRestaurantsIds.includes(parseInt(window.location.search.slice(4)))){
              starButton.classList.add("isFavorite");
          }
      });
  }, false);
  
  console.log(starButton);
  console.log("starButton");
  starButton.addEventListener('click', function toggleFavorite(){
      starButton.classList.toggle("isFavorite"); 
      if (!favoriteRestaurantsIds.includes(parseInt(window.location.search.slice(4)))){
      fetch("http://localhost:1337/restaurants/" +  
      parseInt(window.location.search.slice(4)) + 
      "/?is_favorite=true", {method:'PUT'});
      } else {
          fetch("http://localhost:1337/restaurants/" +  
          parseInt(window.location.search.slice(4)) + 
          "/?is_favorite=false", {method:'PUT'});
      }
  })
  