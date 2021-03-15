let map, infoWindow;
let markers = [];
let destination = {};

const getCurrentLocation = async () => {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
  };
};

const geocodeLatLng = (geocoder, map, infowindow, latlng) => {
  geocoder.geocode({ location: latlng }, (results, status) => {
    if (status === "OK") {
      if (results[0]) {
        map.setZoom(15);
        const marker = new google.maps.Marker({
          position: latlng,
          map: map,
        });
        infowindow.setContent(results[0].formatted_address);
        infowindow.open(map, marker);
      } else {
        window.alert("No results found");
      }
    } else {
      window.alert("Geocoder failed due to: " + status);
    }
  });
};

const moneyFormat = (money) => {
  return money.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + " đ";
};

const getLatLngString = (latlng) => {
  return `${latlng.lat.toString()},${latlng.lng.toString()}`;
};

const calculateAndDisplayRoute = (
  origin,
  destination,
  directionsService,
  directionsRenderer,
  map
) => {
  setMapOnAll(null);
  directionsRenderer.setMap(map);
  directionsService.route(
    {
      origin: getLatLngString(origin),
      destination: destination,
      travelMode: google.maps.TravelMode.WALKING,
      avoidFerries: true,
      avoidHighways: true,
      avoidTolls: true,
      region: "vietnam",
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        // console.log(directionsRenderer.getDirections());
        const distance = computeTotalDistance(
          directionsRenderer.getDirections()
        );
        const price = document.querySelector(".price");
        price.innerHTML = moneyFormat(distance.toFixed(1) * 10000);
        const infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent(distance.toFixed(1).toString() + " km");
        infoWindow.setPosition(
          response.routes[0].legs[0].steps[0].start_location
        );
        infoWindow.setOptions({
          disableAutoPan: true,
        });
        infoWindow.open(map);
      } else {
        console.log("Directions request failed due to " + status);
      }
    }
  );
};

function computeTotalDistance(result) {
  let total = 0;
  const myroute = result.routes[0];

  if (!myroute) return;

  for (let i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000;

  return total;
}

const goBack = () => {
  window.location.replace("/");
};

//initialize map and elements
async function initMap() {
  const currentLocation = await getCurrentLocation();
  console.log(currentLocation);

  //initialize map with current location
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: currentLocation,
    disableDefaultUI: true,
  });
  addMarker(currentLocation);

  //initialize direction service and renderer
  // const directionsService = new google.maps.DirectionsService();
  // const directionsRenderer = new google.maps.DirectionsRenderer();

  //add function for place-item
  // renderPlaceSearchHistory(placeSearchHistory);
  // let placeItems = document.querySelectorAll(".place-item");
  // placeItems.forEach((item) => {
  //   item.addEventListener("click", () => {
  //     const formattedAddress = item.dataset.address;
  //     calculateAndDisplayRoute(
  //       currentLocation,
  //       formattedAddress,
  //       directionsService,
  //       directionsRenderer,
  //       map
  //     );
  //   });
  // });

  //add Location icon to map
  // const centerControlDiv = document.createElement("div");
  // CenterControl(centerControlDiv, map, currentLocation);
  // map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);

  //setBound for autocomplete search
  const defaultBounds = {
    north: currentLocation.lat + 0.1,
    south: currentLocation.lat - 0.1,
    east: currentLocation.lng + 0.1,
    west: currentLocation.lng - 0.1,
  };

  let autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("origin"),
    {
      bounds: defaultBounds,
      componentRestrictions: { country: "vn" },
      fields: ["formatted_address", "geometry", "name"],
      origin: currentLocation,
      strictBounds: false,
      types: ["establishment"],
    }
  );

  const searchResults = document.querySelector(".search-results");
  const origin = document.getElementById("origin");
  const destination = document.getElementById("destination");

  var searchBox = new google.maps.places.SearchBox(origin, {
    bounds: defaultBounds,
  });

  const url = "http://localhost:3000/users/send";
  const data = {
    origin: currentLocation,
    destination: "Chợ Bà Chiểu",
  };

  async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  // const button = document.getElementById("button");
  // button.addEventListener("click", () => {
  //   postData(url, data);
  //   window.location.href = "/";
  // });

  const onInputChanged = (e) => {
    searchResults.classList.remove("hide");
    const displaySuggestions = function (predictions, status) {
      if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
        // alert(status);
        return;
      }
      // console.log(predictions);
      const results = predictions.map((prediction) => {
        return `<div class="place-item" data-address="${prediction.structured_formatting.main_text}">
                      <i class="fas fa-map-marker-alt fa-fw" style="margin-right: 20px"></i>
                       <div style="width: 100%">
                         <div style = "font-size: 16px">
                            ${prediction.structured_formatting.main_text}
                          </div>
                         <div style = "color: grey; margin-top: 2px; font-size: 12px">
                           ${prediction.structured_formatting.secondary_text}
                         </div>
                       </div>
                       <i class="far fa-bookmark fa-fw" style="margin: 0 20px"></i>
                     </div>`;
      });
      searchResults.innerHTML = results.join("");

      const placeItems = document.querySelectorAll(".place-item");
      placeItems.forEach((placeItem) => {
        placeItem.addEventListener("click", () => {
          // postData(url, data);
          window.location.href = `/?origin=${getLatLngString(
            data.origin
          )}&destination="${placeItem.dataset.address}`;
        });
      });
    };

    const request = {
      input: e.target.value,
      bounds: defaultBounds,
      componentRestrictions: { country: "vn" },
      strictBounds: false,
      types: ["establishment"],
    };

    const service = new google.maps.places.AutocompleteService();
    if (e.target.value.length === 0) {
      searchResults.classList.add("hide");
      return;
    }
    service.getQueryPredictions(request, displaySuggestions);
  };

  origin.addEventListener("click", (e) => {
    origin.focus();
    origin.select();
  });
  origin.addEventListener("input", onInputChanged);
  destination.addEventListener("input", onInputChanged);

  // searchBox.addListener("places_changed", () => {
  //   const places = searchBox.getPlaces();
  //   // console.log(places);
  //   if (places.length == 0) {
  //     return;
  //   }
  //   // Clear out the old markers.
  //   markers.forEach((marker) => {
  //     marker.setMap(null);
  //   });
  //   markers = [];
  //   // For each place, get the icon, name and location.
  //   const bounds = new google.maps.LatLngBounds();
  //   places.forEach((place) => {
  //     if (!place.geometry || !place.geometry.location) {
  //       console.log("Returned place contains no geometry");
  //       return;
  //     }
  //     const icon = {
  //       url: place.icon,
  //       size: new google.maps.Size(71, 71),
  //       origin: new google.maps.Point(0, 0),
  //       anchor: new google.maps.Point(17, 34),
  //       scaledSize: new google.maps.Size(25, 25),
  //     };
  //     // Create a marker for each place.
  //     markers.push(
  //       new google.maps.Marker({
  //         map,
  //         icon,
  //         title: place.name,
  //         position: place.geometry.location,
  //       })
  //     );

  //     if (place.geometry.viewport) {
  //       // Only geocodes have viewport.
  //       bounds.union(place.geometry.viewport);
  //     } else {
  //       bounds.extend(place.geometry.location);
  //     }
  //   });
  //   map.fitBounds(bounds);
  // });
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

const getCurrentLocationName = async (latlng) => {
  const geocoder = new google.maps.Geocoder();
  const name = await new Promise((resolve, reject) => {
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          resolve(results[0].formatted_address);
        } else {
          window.alert("No results found");
        }
      } else {
        window.alert("Geocoder failed due to: " + status);
      }
    });
  });
  return name;
};

// Adds a marker to the map and push to the array.
function addMarker(location) {
  const marker = new google.maps.Marker({
    position: location,
    map: map,
  });
  markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
