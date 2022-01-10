let price, distance, origin, destination;
let map, infoWindow;
let markers = [];
let infoWindows = [];
let directionsRenderer, directionsService;
const distanceField = document.getElementById("distance");

//initialize map and elements
async function initMap() {
  const currentLocation = await getCurrentLocation();
  origin = await getCurrentLocationName(currentLocation);
  console.log(origin);

  //initialize map with current location
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: currentLocation,
    disableDefaultUI: true,
  });
  addMarker(currentLocation);

  //initialize direction service and renderer
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();

  //add function for place-item
  // renderPlaceSearchHistory(placeSearchHistory);

  //NHẤN VÀO CÁC ĐỀ XUẤT NƠI ĐẾN
  let placeItems = document.querySelectorAll("#place-item");
  placeItems.forEach((item) => {
    item.addEventListener("click", () => {
      destination = item.dataset.address;

      historyPanel.classList.add("d-none");
      searchBar.classList.add("d-none");
      pricePanel.classList.remove("d-none");

      calculateAndDisplayRoute(
        origin,
        destination,
        directionsService,
        directionsRenderer,
        map
      );
    });
  });

  //add Location icon to map
  const centerControlDiv = document.createElement("div");
  CenterControl(centerControlDiv, map, currentLocation);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);

  //search
  const defaultBounds = {
    north: currentLocation.lat + 0.1,
    south: currentLocation.lat - 0.1,
    east: currentLocation.lng + 0.1,
    west: currentLocation.lng - 0.1,
  };

  const searchResults = document.querySelector("#search-results");
  const originInput = document.getElementById("origin-input");
  const destinationInput = document.getElementById("destination-input");

  //HIỂN THỊ CÁC ĐỀ XUẤT NƠI CẦN ĐẾN
  const onInputChanged = (e) => {
    const request = {
      input: e.target.value,
      bounds: defaultBounds,
      componentRestrictions: { country: "vn" },
      strictBounds: true,
      types: ["establishment"],
    };

    searchResults.classList.remove("hide");

    const displaySuggestions = function (predictions, status) {
      if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
        // alert(status);
        return;
      }
      // console.log(predictions);
      const results = predictions.map((prediction, index) => {
        return `<div
                  class="d-flex align-items-center justify-content-start py-2 px-2 border border-success rounded mt-2"
                  id="place-item"
                  data-address="${prediction.description}"
                >
                  <i class="bi bi-geo-alt"></i>
                  <div class="px-2 overflow-hidden w-100">
                    <h6 class="text-truncate">
                      ${prediction.structured_formatting.main_text}
                    </h6>
                    <p
                      class="text-truncate text-secondary my-0"
                      style="font-size: 12px"
                    >
                      ${prediction.structured_formatting.secondary_text}
                    </p>
                  </div>
                  <i class="bi bi-bookmark-heart"></i>
                </div>`;
      });
      searchResults.innerHTML = results.join("");

      const placeItems = document.querySelectorAll("#place-item");
      placeItems.forEach((placeItem) => {
        placeItem.addEventListener("click", () => {
          destination = placeItem.dataset.address;

          calculateAndDisplayRoute(
            origin,
            placeItem.dataset.address,
            directionsService,
            directionsRenderer,
            map
          );

          searchModal.hide();
          historyPanel.classList.add("d-none");
          searchBar.classList.add("d-none");
          pricePanel.classList.remove("d-none");
        });
      });
    };

    const service = new google.maps.places.AutocompleteService();
    if (e.target.value.length === 0) {
      searchResults.classList.add("hide");
      return;
    }
    service.getQueryPredictions(request, displaySuggestions);
  };

  originInput.addEventListener("click", (e) => {
    originInput.focus();
    originInput.select();
  });
  originInput.addEventListener("input", onInputChanged);
  destinationInput.addEventListener("input", onInputChanged);
}

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

const getLatLngObject = (latlng) => {
  console.log(typeof latlng);
  const a = latlng.split(",");
  return {
    lat: Number(a[0]),
    lng: Number(a[1]),
  };
};

const calculateAndDisplayRoute = async (
  origin,
  destination,
  directionsService,
  directionsRenderer,
  map
) => {
  clearInfoWindow();
  directionsRenderer.setMap(map);
  directionsService.route(
    {
      origin: origin,
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
        distance = computeTotalDistance(
          directionsRenderer.getDirections()
        ).toFixed(1);

        const priceTable = document.querySelector(".price");
        if (priceTable) {
          price = Number.parseFloat(distance).toFixed(1) * 10000;
          priceTable.innerHTML = moneyFormat(price);
        }

        infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent(Number.parseFloat(distance).toFixed(1) + " km");
        infoWindow.setPosition(
          response.routes[0].legs[0].steps[0].start_location
        );
        infoWindow.setOptions({
          disableAutoPan: true,
        });
        infoWindow.open(map);
        // infoWindow.close();
        infoWindows.push(infoWindow);
      } else {
        console.log("Directions request failed due to " + status);
      }
    }
  );
};

const computeTotalDistance = (result) => {
  let total = 0;
  const myroute = result.routes[0];

  if (!myroute) return;

  for (let i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000;

  return total;
};

const handleLocationError = (browserHasGeolocation, infoWindow, pos) => {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
};

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

const CenterControl = (controlDiv, map, currentLocation) => {
  const controlBox = document.createElement("div");
  // controlBox.style.backgroundColor = "whitesmoke";
  controlBox.style.padding = "10px";
  controlBox.style.borderRadius = "5px";
  controlBox.style.margin = "0 30px 30px 0 ";

  const controlIcon = document.createElement("div");
  // controlIcon.style.backgroundImage = "url(/image/cursor.svg)";
  // controlIcon.style.backgroundPosition = "center";
  // controlIcon.style.backgroundRepeat = "no-repeat";
  // controlIcon.style.backgroundSize = "cover";
  controlIcon.style.cursor = "pointer";
  // controlIcon.style.height = "20px";
  // controlIcon.style.width = "20px";
  controlBox.appendChild(controlIcon);
  controlBox.innerHTML = `<i class="bi bi-geo-alt-fill" style="font-size: 20px"></i>`;
  controlDiv.appendChild(controlBox);
  controlBox.classList.add("bg-danger");
  controlBox.classList.add("text-white");

  controlDiv.addEventListener("click", () => {
    map.setCenter(currentLocation);
    map.setZoom(15);
    new google.maps.Marker({
      map: map,
      position: currentLocation,
    });
  });
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

function clearInfoWindow() {
  for (let i = 0; i < infoWindows.length; i++) {
    infoWindows[i].close();
  }
}
