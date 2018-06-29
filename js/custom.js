var dbPromise = idb.open("restaurantReviewsDb",1, function(upgradeDb){
  upgradeDb.createObjectStore('restaurantReviews', {keyPath: 'restaurant_id'}) 
});

// add a review
const addReview = document.forms["add-review"];
addReview.addEventListener("submit", function(e) {
    e.preventDefault()
    console.log(e);
    const userName = addReview.querySelector('#user_name').value;
    const userReview = addReview.querySelector('#user_review').value; 
    console.log("userName", userName);
    console.log("userReview", userReview);
    const url = 'http://localhost:1337/reviews/';
    const review = {
    'restaurant_id':  parseInt(window.location.search.slice(4)),
    'name': userName,
    //'rating': 5,
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
        // How to check for a 404 response?? After you check for 404 store to idb 
        dbPromise.then(function(db){
        var tx = db.transaction('restaurantReviews', 'readwrite');
        var restaurantsReviewsStore = tx.objectStore('restaurantReviews');
        restaurantsReviewsStore.put(review);
        })
        console.error('My custom error message:', error)})
    .then(response => {
        console.log('Success:', response);
        addReview.reset(); //reset form
    }  );    
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

