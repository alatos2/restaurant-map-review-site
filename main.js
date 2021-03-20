let map, infoWindow, infoWindowNew, infoRestaurantWindow, marker, places, service, restaurantIsNew = false;

function initMap(lat=-34.397, long=150.644) {
    const uluru = { lat: lat, lng: long };

    map = new google.maps.Map(document.getElementById("map"), {
        center: uluru,
        zoom: 15,
    });
    
    infoWindow = new google.maps.InfoWindow();
    infoRestaurantWindow = new google.maps.InfoWindow();
    infoWindowNew = new google.maps.InfoWindow();
    // infoRestaurantWindow = new google.maps.InfoWindow();

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          infoWindow.setPosition(pos);
          infoWindow.setContent("Here is your location 😎.");
          // infoWindow.open(map);
          map.setCenter(pos);

          
          marker = new google.maps.Marker({ position: pos, draggable: false })

          marker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function () {
            marker.setAnimation(null)
          }, 4000);
          marker.setMap(map);

          var request = {
            location: pos,
            radius: 2500,
            type: ['restaurant']
          };

          service = new google.maps.places.PlacesService(map);
          service.nearbySearch(request, callback);

          // adds new restaurant and marker

          map.addListener('rightclick', function(e) {
            restaurantIsNew = true;
                let latlng = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
                let marker = new google.maps.Marker({
                    position: latlng,
                    // icon: createMarkerStars(latlng),
                    // id: 'our-marker'
                });
                google.maps.event.addListener(marker, 'click', addRestaurantInfoWindow);

                // google.maps.event.addListener(infoWindowNew, 'domready', function() {
                //     const restaurantName = document.getElementById('res-name').value;
                //     document.getElementById('add-restaurant').addEventListener('click', function() {
                //         console.log(restaurantName.value)
                //     })
                // })
                marker.setMap(map);
          })


        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    } else {
      // Browser doesn't support Geolocation
      handleLocationError(false, infoWindow, map.getCenter());
    }
}


// fetch('./data.json')
// .then(res => res.json())
// .then(data => {
//     let restaurants = document.getElementById('restaurants');
//     let searchBtn = document.getElementById('search-btn');
//     let restaurantDetails = document.getElementById('restaurant-details');

//     for (let dt in data) {
//         let opt = document.createElement('option');
//         opt.value = data[dt].restaurantName;
//         opt.innerHTML = data[dt].restaurantName;
//         restaurants.appendChild(opt);

//         searchBtn.addEventListener('click', (e) => {
//             e.preventDefault();
//             if (data[dt].restaurantName === restaurants.value) {
//                 initMap(data[dt].lat, data[dt].long);
//                 console.log(data[dt].lat, data[dt].long)
//                 restaurantDetails.innerHTML = `
//                     <hr>
//                     <b>Restaurant Name:</b> <br> ${data[dt].restaurantName} <br>
//                     <hr>
//                     <b>Address:</b> <br> ${data[dt].address} <br>
//                     <hr>
//                     <b>Ratings:</b> <br> ${getRatings(data[dt].ratings.map(x => x))} <br>
//                     <hr>
//                 `;
//             } else {
//                 initMap(-34.397, 150.644);
//             }
//         })
//     }
// })

function getRatings(ratings) {
    let ratings_comments = '';
    for (let rating = 0; rating < ratings.length; rating++) {
        ratings_comments += `
            <div style="text-align: justify; background: white; color: black; padding: 5px">
                <b>stars:</b> ${ratings[rating].stars} <br>
                <b>comment:</b> ${ratings[rating].comment}
            </div>
        `;
    }
    return ratings_comments;
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
      browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;
  marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    title: 'hello',
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'blue',
      fillOpacity: 0.3,
      scale: 20,
      strokeColor: 'blue',
      strokeWeight: 1,
      zIndex: 1
  },
  });
  google.maps.event.addListener(marker, "mouseover", () => {
    infoWindow.setContent(place.name || "");
    infoWindow.open(map);
  });

    // getReviews(place)

    let restaurants = document.getElementById('restaurant-details');
    let li = document.createElement('li');
    li.innerHTML = `
      <div class="restaurantContent">
        <p><img src='${getPhotos(place)}' class='restaurant-img' /></p>
        <p><b>${place.name}</b></p>
        <p>📧 <small>${place.vicinity}</small></p>
        <div style="color:#eb853b;">${place.rating ? starRating(place) : '<small>No Rating</small>' }</div>
        <a href='/'>See Review</a>
        <ul id="comments"></ul>
        <hr>
    `;
    restaurants.appendChild(li);
}

function getPhotos(place) {
  let photo;
  if (place.photos) {
    photo = place.photos[0].getUrl({
      'maxWidth': 290,
      'maxHeight': 300
    });
  } else {
    photo = place.icon;
  }
  return photo;
}

function starRating(place) {
  let rating = [];
//   if (place.rating) {
      for (let i = 0; i < 5; i++) {
          if (place.rating < (i + 0.5)) {
              rating.push('&#10025;');
          } else {
              rating.push('&#10029;');
          }
      }
      return rating.join(' ');
  //}
}

function getReviews(place) {
  let request = {
    placeId: place.place_id
  }
  let ul = document.getElementById('comments');
  let comments = [];
  const sss = new google.maps.places.PlacesService(map);

  sss.getDetails(request, function(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (let i = 0; place.reviews.length; i++) {
        //   comments.push(`<li>${place.reviews[i].text}</li>`);
        console.log(place.reviews[i].text);
      }
    }
  });
}

function addRestaurantInfoWindow() {

    console.log(this.position.lat(), this.position.lng())

    let node = document.createElement('div');

    node.innerHTML = `
        <h4>Add New Restaurant</h4>
        <input type="text" id="res-name" class="form-control form-control-sm" placeholder="Restaurant Name" required/>
        <input type="text" id="res-address" class="form-control form-control-sm mt-2" placeholder="Restaurant Address" required/>
        <select id="res-rating" class="form-control form-control-sm mt-2" required>
            <option value="">---Rating---</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
        </select>
        <button id="add-restaurant" class="btn btn-warning btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#successModal">Add New Restaurant</button>
        <label id="error-msg" style="color: red"></label>`;

    let marker = this;
    infoWindowNew.open(map, marker);
    infoWindowNew.setContent(node);
    google.maps.event.addListener(infoWindowNew, 'domready', function(e) {
        const restaurantName = document.getElementById('res-name');
        const restaurantAdd = document.getElementById('res-address');
        let rating = document.getElementById('res-rating');
        let btn = document.getElementById('add-restaurant');

        let place = {
            name: restaurantName.value,
            vicinity: restaurantAdd.value,
            rating: rating.value,
            // position: position,
            // geometry: {location: position},
            icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png',
            reviews: '',
            photos: '',

        };
            btn.enabled = true;
            btn.addEventListener('click', function() {
                console.log(restaurantName.value, restaurantAdd.value, rating.value);

                let restaurants = document.getElementById('restaurant-details');
                let li = document.createElement('li');
                li.innerHTML = `
                <div class="restaurantContent">
                    <p><img src='${place.icon}' class='restaurant-img' /></p>
                    <p><b>${restaurantName.value}</b></p>
                    <p>📧 <small>${restaurantAdd.value}</small></p>
                    <div style="color:#eb853b;">${starRating(place)}</div>
                    <a href='/'>See Review</a>
                    <ul id="comments"></ul>
                `;
                restaurants.appendChild(li);
                infoWindowNew.close();
            })
    })
}
