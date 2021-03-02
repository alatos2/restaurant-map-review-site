// let map;

// function initMap() {
//   map = new google.maps.Map(document.getElementById("map"), {
//     center: { lat: -34.397, lng: 150.644 },
//     zoom: 8,
//   });
// }

let map;

function initMap(lat=-34.397, long=150.644) {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: lat, lng: long },
    zoom: 8,
  });
}

fetch('./data.json')
.then(res => res.json())
.then(data => {
    let restaurants = document.getElementById('restaurants');
    let searchBtn = document.getElementById('search-btn');
    let restaurantDetails = document.getElementById('restaurant-details');

    for (let dt in data) {
        let opt = document.createElement('option');
        opt.value = data[dt].restaurantName;
        opt.innerHTML = data[dt].restaurantName;
        restaurants.appendChild(opt);

        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (data[dt].restaurantName === restaurants.value) {
                initMap(data[dt].lat, data[dt].long);
                console.log(data[dt].lat, data[dt].long)
                restaurantDetails.innerHTML = `
                    <hr>
                    <b>Restaurant Name:</b> <br> ${data[dt].restaurantName} <br>
                    <hr>
                    <b>Address:</b> <br> ${data[dt].address} <br>
                    <hr>
                    <b>Ratings:</b> <br> ${getRatings(data[dt].ratings.map(x => x))} <br>
                    <hr>
                `;
            } else {
                initMap(-34.397, 150.644);
            }
        })
    }
})

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