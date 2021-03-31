// let map, infoWindow, infoWindowNew, infoRestaurantWindow, marker, places, service, restaurantIsNew = false;

function initMap(lat=-34.397, long=150.644) {
    const uluru = { lat: lat, lng: long };

    map = new google.maps.Map(document.getElementById("map"), {center: uluru, zoom: 15,});

    infoWindow = new google.maps.InfoWindow();
    infoRestaurantWindow = new google.maps.InfoWindow();
    infoWindowNew = new google.maps.InfoWindow();

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
          setTimeout(function () {marker.setAnimation(null)}, 4000);
          marker.setMap(map);

          var request = {location: pos, radius: 2500, type: ['restaurant']};

          service = new google.maps.places.PlacesService(map);
          service.nearbySearch(request, callback);

          // adds new restaurant and marker

          map.addListener('rightclick', function(e) {
            restaurantIsNew = true;
                let latlng = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
                let marker = new google.maps.Marker({
                    position: latlng
                });
                google.maps.event.addListener(marker, 'click', restaurant.AddRestaurantInfoWindow);
                marker.setMap(map);
          })
        },
        () => {
          handleLocationError(true, infoWindow, map.getCenter());
        }
      );
    }
}

class Restaurant {
    CreateMarker(place) {
        if (!place.geometry || !place.geometry.location) return;
      
        const request = {
          placeId: place.place_id
        };
      
        let infowindow11 = new google.maps.InfoWindow();
        let service = new google.maps.places.PlacesService(map);
      
        service.getDetails(request, function(place, status) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            let marker = new google.maps.Marker({
              map: map,
              position: place.geometry.location,
              icon: {
                // path: google.maps.SymbolPath.CIRCLE,
                path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW,
                fillColor: 'green',
                fillOpacity: 0.3,
                stroke: 'green',
                strokeWeight: 1,
                scale: 10
              }
            });
            google.maps.event.addListener(marker, 'click', function() {
              let div = document.createElement('div');
              div.style.width = '300px';
              div.style.backgroundColor = 'black';
              div.innerHTML = listRestaurantMarker(getPhotos(place), place.name, place.vicinity, place, place.reviews[0].text);
              infowindow11.setContent(div);
              infowindow11.open(map, this);
            });
            let restaurants = document.getElementById('restaurant-details');
            restaurants.setAttribute('class', 'restaurant-list');
            let li = document.createElement('li');
            li.innerHTML = listRestaurant(getPhotos(place), place.name, place.vicinity, place, place.reviews[0].text);

            restaurants.appendChild(li);
          }
          
        });
        
        let rating1to3 = [];
        let rating4to5 = [];

        const getRate = document.getElementById('selectRate');
        const btn = document.getElementById('rateBtn');

        let restaurants = document.getElementById('restaurant-details');
        let restaurants_sort1 = document.getElementById('restaurant-sort1to3-details');
        let restaurants_sort2 = document.getElementById('restaurant-sort4to5-details');
        let sortedLi = document.createElement('li');

        btn.addEventListener('click', () => {
          rating1to3 = []; rating4to5 = [];
          if (getRate.value <= 3 && place.rating <= 3) {
            rating1to3.push(place);
            restaurants.setAttribute('class', 'hide-controls');
            restaurants_sort2.setAttribute('class', 'hide-controls');
            
            restaurants_sort1.setAttribute('class', 'restaurant-list');
            sortedLi.innerHTML = listRestaurantSort(rating1to3[0].vicinity, getPhotos(rating1to3[0]), rating1to3[0].name, rating1to3[0]);
            restaurants_sort1.appendChild(sortedLi);
          }else if (getRate.value >= 4 && place.rating >= 4) {
            rating4to5.push(place);
            restaurants.setAttribute('class', 'hide-controls');
            restaurants_sort1.setAttribute('class', 'hide-controls');
            
            restaurants_sort2.setAttribute('class', 'restaurant-list');
            sortedLi.innerHTML = listRestaurantSort(rating4to5[0].vicinity, getPhotos(rating4to5[0]), rating4to5[0].name, rating4to5[0]);
            restaurants_sort2.appendChild(sortedLi);
          } else if (getRate.value == 'all') {
            window.location.reload();
          }
        })
    }

    AddRestaurantInfoWindow() {
    
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
            <input type="text" id="res-review" class="form-control form-control-sm mt-2" placeholder="Restaurant Review" required/>
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
                icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/restaurant-71.png'
            };
            btn.enabled = true;
            btn.addEventListener('click', function() {
                let restaurants = document.getElementById('restaurant-details');
                let restaurants_review = document.getElementById('res-review');
                let restaurants_rating = document.getElementById('res-rating');
                let li = document.createElement('li');
                li.innerHTML = `
                <div class="row">
                  <div class="col-sm">
                    <img src='${place.icon}' class="rounded float-start" width="150" height="100" />
                  </div>
                  <div class="col-sm">
                    <div class="row"><b style="color:white">${restaurantName.value}</b></div>
                    <div style="color:#eb853b; padding-left: 8px" class="row">${starRating2(restaurants_rating.value)}</div>
                    <div class="row"><a class="link-success" href='#' id="review-link">Add Review</a></div>
                  </div>
                  <div style="color: white; padding-left: 15px; padding-top: 5px" class="row"><small><b>Reviews: </b>${restaurants_review.value}</small></div>
                </div>
              <hr>`;
                restaurants.appendChild(li);
                infoWindowNew.close(map, marker);
            })
        })
    }
}

function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        restaurant.CreateMarker(results[i]);
      }
    }
}

function listRestaurantMarker(getPhotos, getName, getVicinity, getRating, getReviews) {
    return `<div class="restaurantContent" style="width: 300px">
    <p><img src='${getPhotos}' class='restaurant-img' /></p>
    <p><b style="color:white">${getName}</b></p>
    <p>📧 <small>${getVicinity}</small></p>
    <div style="color:#eb853b;">${getRating ? starRating(getRating) : '&#10025;&#10025;&#10025;&#10025;&#10025;'}</div>
    <div class="accordion" id="accordionFlushExample">
    <div class="accordion-item">
      <h2 class="accordion-header" id="headingOne">
        <button id="accordion-btn" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
          See Reviews
        </button>
      </h2>
      <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFlushExample">
        <div class="accordion-body">${getReviews}</div>
      </div>
    </div>
    </div>
    <hr>`;
}

function listRestaurant(getPhotos, getName, getVicinity, getRating, getReviews) {
  return `
    <div class="row">
      <div class="col-sm">
        <img src='${getPhotos}' class="rounded float-start" width="150" height="100" />
      </div>
      <div class="col-sm">
        <div class="row"><b style="color:white">${getName}</b></div>
        <div style="color:#eb853b; padding-left: 8px" class="row">${getRating ? starRating(getRating) : '&#10025;&#10025;&#10025;&#10025;&#10025;'}</div>
        <div class="row"><a class="link-success" href='#' onclick="addReview()">Add Review</a></div>
      </div>
      <small style="color: white; padding-left: 25px; padding-top: 5px" class="small-reviews row">Reviews: ${getReviews}</small>
    </div>
  <hr>`;
}


function listRestaurantSort(getVicinity, getPhotos, getName, getRating) {
  return `
    <div class="row">
      <div class="col-sm">
        <img src='${getPhotos}' class="rounded float-start" width="150" height="100" />
      </div>
      <div class="col-sm">
        <div class="row"><b style="color:white">${getName}</b></div>
        <div style="color:#eb853b; padding-left: 8px" class="row">${getRating ? starRating(getRating) : '&#10025;&#10025;&#10025;&#10025;&#10025;'}</div>
      </div>
      <div style="color: white; padding-left: 15px; padding-top: 5px" class="row"><small><b>Address: </b>${getVicinity}</small></div>
    </div>
  <hr>`;
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
    for (let i = 0; i < 5; i++) {
        if (place.rating < (i + 0.5)) {
            rating.push('&#10025;');
        } else {
            rating.push('&#10029;');
        }
    }
    return rating.join(' ');
}

function starRating2(val) {
  let rating = [];
  for (let i = 0; i < 5; i++) {
      if (val < (i + 0.5)) {
          rating.push('&#10025;');
      } else {
          rating.push('&#10029;');
      }
  }
  return rating.join(' ');
}

function addReview() {
  const ans = prompt('Add a review');

  if (ans == '' || ans == null) return;

  if (this.event.target) {
      const getReviews = this.event.target.parentNode.parentNode.nextElementSibling;
      getReviews.innerHTML += `<li>🔘 ${ans}</li>`;
      console.log(this.event.target.parentNode.parentNode.nextElementSibling)
    }
}

const restaurant = new Restaurant();
