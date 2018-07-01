var altTags = {
  1:"the dining area at a crowded night",
  2:"whole pizza on a plate on a wooden surface",
  3:"the dining area empty of people",
  4:"street view of the corner entrance" ,
  5:"the dining and cooking area at a crowded noon",
  6:"the dining area at lunchtime",
  7:"street view of the restaurant",
  8:"The Dutch sign",
  9:"people eating on a table" ,
}
/**
 * Common database helper functions.
 */



class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 8000; // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {

    var dbPromise = idb.open("restaurantsDb",1, function(upgradeDb){
      upgradeDb.createObjectStore('restaurants', {keyPath: 'id'}) 
    });
    // query the restaurantsDb for the restaurantsStore to avoid going to the network
    dbPromise.then(function(db){
      var tx = db.transaction('restaurants', "readwrite");
      var restaurantsStore = tx.objectStore('restaurants');
      return restaurantsStore.getAll()
    }).then(function(restaurants){
      // if there restaurants stored get them
      if (restaurants.length){
        callback(null, restaurants)
      } else { // if there are not already restaurants stored fetch them and put them to the idb
        fetch("http://localhost:1337/restaurants")
        .then(response=>response.json())
        .then(restaurants=>{
          restaurants.forEach((restaurant, index)=>{
            if (restaurant.photograph){
              restaurant.photograph_small = restaurant.photograph +  "s";
              restaurant.photograph_medium = restaurant.photograph + "m";
              restaurant.alt = altTags[restaurant.id]
            }
          })
          // store the data from the API call to 
          dbPromise.then(function(db){
            var tx = db.transaction('restaurants', 'readwrite');
            var restaurantsStore = tx.objectStore('restaurants');
            restaurants.forEach(restaurant=>restaurantsStore.put(restaurant))
          })
          callback(null,restaurants)}
        );
      }
    })
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          // Got the restaurant
          callback(null, restaurant);
        } else {
          // Restaurant does not exist in the database
          callback("Restaurant does not exist", null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return restaurant.photograph && `/img/${restaurant.photograph}.jpg`;
  }

  /**
   * Restaurant medium image URL.
   */
  static mediumImageUrlForRestaurant(restaurant) {
    return restaurant.photograph && `/img/${restaurant.photograph_medium}.jpg`;
  }

  /**
   * Restaurant small image URL.
   */
  static smallImageUrlForRestaurant(restaurant) {
    return restaurant.photograph && `/img/${restaurant.photograph_small}.jpg`;
  }

  /**
   * Restaurant image alt tag.
   */
  static imageAltTagForRestaurant(restaurant) {

    return restaurant.alt;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}
