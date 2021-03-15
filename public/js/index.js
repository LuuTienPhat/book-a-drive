let map, infoWindow;
let markers = [];
let destination = {};
let placeSearchHistory = [
  {
    formatted_address:
      "Chợ Bà Chiểu, đường, Bạch Đằng, Phường 1, Bình Thạnh, Thành phố Hồ Chí Minh 700000, Việt Nam",
    name: "Chợ Bà Chiểu",
    latlng: "",
  },
  {
    formatted_address:
      "Chợ Bà Chiểu, đường, Bạch Đằng, Phường 1, Bình Thạnh, Thành phố Hồ Chí Minh 700000, Việt Nam",
    name: "Chợ Bà Chiểu",
    latlng: "",
  },
  {
    formatted_address:
      "Chợ Bà Chiểu, đường, Bạch Đằng, Phường 1, Bình Thạnh, Thành phố Hồ Chí Minh 700000, Việt Nam",
    name: "Chợ Bà Chiểu",
    latlng: "",
  },
];

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
  return `${latlng.lat.toString()}, ${latlng.lng.toString()}`;
};

const calculateAndDisplayRoute = (
  origin,
  destination,
  directionsService,
  directionsRenderer,
  map
) => {
  clearMarkers();
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
  // const priceList = document.querySelector(".price-list");
  const optionTable = document.querySelector(".option-table");
  const origin = document.querySelector(".origin").dataset.origin;
  const destination = document.querySelector(".destination").dataset
    .destination;

  const currentLocation = await getCurrentLocation();

  //initialize map with current location
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: currentLocation,
    disableDefaultUI: true,
  });
  addMarker(currentLocation);
  //initialize direction service and renderer
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  if (destination !== "") {
    calculateAndDisplayRoute(
      currentLocation,
      destination,
      directionsService,
      directionsRenderer,
      map
    );
  }

  async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  //add function for place-item
  renderPlaceSearchHistory(placeSearchHistory);
  let placeItems = document.querySelectorAll(".place-item");
  placeItems.forEach((item) => {
    item.addEventListener("click", () => {
      // const formattedAddress = item.dataset.address;
      // calculateAndDisplayRoute(
      //   currentLocation,
      //   formattedAddress,
      //   directionsService,
      //   directionsRenderer,
      //   map
      // );
      window.location.href = `/?origin=${getLatLngString(
        currentLocation
      )}&destination=${item.dataset.address}`;
      // postData("/directions", {
      //   origin: getLatLngString(currentLocation),
      //   dest: "Chợ bà chiểu",
      // });
    });
    // priceList.classList.remove("hide");
    // optionTable.classList.add("hide");
  });

  //add Location icon to map
  const centerControlDiv = document.createElement("div");
  CenterControl(centerControlDiv, map, currentLocation);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);

  const url = window.location;
  // console.log(window.location.search);
  let d;
  const input = document.querySelector(".input-container");
  input.addEventListener("click", async () => {
    window.location.href = "/search";
  });
  // console.log(d);

  // const optionTable = document.querySelector(".option-table");
  const price = document.querySelector(".price");
  // const priceList = document.querySelector(".price-list");
  // console.log(priceList);
  // const onInputClicked = () => {
  //   document.getElementById("map").style.height = "0%";
  //   optionTable.style.height = "100vh";
  //   history.classList.add("hide");
  // };

  // input.addEventListener("click", onInputClicked);

  // const onPlaceChanged = () => {
  //   let place = autocomplete.getPlace();

  //   if (!place.geometry) {
  //     document.getElementById("input").placeholder = "Enter a place";
  //   } else {
  //     calculateAndDisplayRoute(
  //       currentLocation,
  //       place.formatted_address,
  //       directionsService,
  //       directionsRenderer,
  //       map
  //     );
  //     placeSearchHistory.push(place);
  //     priceList.classList.remove("hide");

  //     document.getElementById("map").style.height = "50%";
  //     optionTable.style.height = "50%";
  //   }
  // };

  // autocomplete.addListener("place_changed", onPlaceChanged);
}

const renderPlaceSearchHistory = (placeSearchHistory) => {
  const result = placeSearchHistory.map((place) => {
    return `<div class="place-item" data-address="${place.formatted_address}">
              <i class="fas fa-map-marker-alt"></i>   
              <div style = "margin-left: 20px">
                <h4>${place.name}</h4>
                <div style = "color: grey; margin-top: 2px">
                  ${place.formatted_address}
                </div>
              </div> 
            </div>`;
  });

  const history = document.querySelector(".history");
  history.innerHTML = result.join("");
};

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

function CenterControl(controlDiv, map, currentLocation) {
  const controlBox = document.createElement("div");
  controlBox.style.backgroundColor = "whitesmoke";
  controlBox.style.padding = "10px";
  controlBox.style.borderRadius = "50%";
  controlBox.style.margin = "0 30px 30px 0 ";

  const controlIcon = document.createElement("div");
  controlIcon.style.backgroundImage = "url(/image/cursor.svg)";
  controlIcon.style.backgroundPosition = "center";
  controlIcon.style.backgroundRepeat = "no-repeat";
  controlIcon.style.backgroundSize = "cover";
  controlIcon.style.cursor = "pointer";
  controlIcon.style.height = "20px";
  controlIcon.style.width = "20px";
  controlBox.appendChild(controlIcon);

  controlDiv.appendChild(controlBox);

  controlDiv.addEventListener("click", () => {
    map.setCenter(currentLocation);
    map.setZoom(15);
    new google.maps.Marker({
      map: map,
      position: currentLocation,
    });
  });
}

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
