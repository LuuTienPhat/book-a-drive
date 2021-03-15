let map, infoWindow;

let destination = {};
let placeSearchHistory = [
  {
    formatted_address:
      "Chợ Bà Chiểu, đường, Bạch Đằng, Phường 1, Bình Thạnh, Thành phố Hồ Chí Minh 700000, Việt Nam",
    name: "Chợ Bà Chiểu",
  },
];

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
  console.log(history);
  console.log();
  history.innerHTML = result.join("");
};

const getCurrentLocation = async () => {
  const pos = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
  };
};

function CenterControl(controlDiv, map, currentLocation) {
  const controlBox = document.createElement("div");
  controlBox.style.backgroundColor = "whitesmoke";
  controlBox.style.padding = "10px";
  controlBox.style.borderRadius = "50%";
  controlBox.style.margin = "0 30px 30px 0 ";

  const controlIcon = document.createElement("div");
  controlIcon.style.backgroundImage = "url(cursor.svg)";
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

const calculateAndDisplayRoute = (
  origin,
  destination,
  directionsService,
  directionsRenderer,
  map
) => {
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
  // console.log(result);
  const myroute = result.routes[0];

  if (!myroute) {
    return;
  }

  for (let i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000;

  return total;
}

async function initMap() {
  // let currentLocationName = "";
  const currentLocation = await getCurrentLocation();

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: currentLocation,
    disableDefaultUI: true,
  });
  new google.maps.Marker({
    map: map,
    position: currentLocation,
  });

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const currentLocationName = await getCurrentLocationName(currentLocation);

  //add function for place-item
  renderPlaceSearchHistory(placeSearchHistory);
  let placeItems = document.querySelectorAll(".place-item");
  placeItems.forEach((item) => {
    item.addEventListener("click", () => {
      const formattedAddress = item.dataset.address;
      calculateAndDisplayRoute(
        currentLocation,
        formattedAddress,
        directionsService,
        directionsRenderer,
        map
      );
    });
  });

  const centerControlDiv = document.createElement("div");
  CenterControl(centerControlDiv, map, currentLocation);
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);

  const defaultBounds = {
    north: currentLocation.lat + 0.1,
    south: currentLocation.lat - 0.1,
    east: currentLocation.lng + 0.1,
    west: currentLocation.lng - 0.1,
  };
  let autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("input"),
    {
      bounds: defaultBounds,
      componentRestrictions: { country: "vn" },
      fields: ["formatted_address", "geometry", "name"],
      origin: map.getCenter(),
      strictBounds: false,
      types: ["establishment"],
    }
  );

  const input = document.getElementById("input");
  const optionTable = document.querySelector(".option-table");
  const price = document.querySelector(".price");
  const priceList = document.querySelector(".price-list");
  // console.log(priceList);

  const history = document.querySelector(".history");

  const onInputClicked = () => {
    document.getElementById("map").style.height = "0%";
    optionTable.style.height = "100vh";
    history.classList.add("hide");
  };

  input.addEventListener("click", onInputClicked);

  const onPlaceChanged = () => {
    let place = autocomplete.getPlace();

    if (!place.geometry) {
      document.getElementById("input").placeholder = "Enter a place";
    } else {
      calculateAndDisplayRoute(
        currentLocationName,
        place.formatted_address,
        directionsService,
        directionsRenderer,
        map
      );
      placeSearchHistory.push(place);
      console.log(placeSearchHistory);
      // console.log(directionsRenderer.directions);
      priceList.classList.remove("hide");

      document.getElementById("map").style.height = "50%";
      optionTable.style.height = "50%";
    }
  };

  autocomplete.addListener("place_changed", onPlaceChanged);

  // console.log(currentLocation);

  // await navigator.geolocation.getCurrentPosition((position) => {
  //   const pos = {
  //     lat: position.coords.latitude,
  //     lng: position.coords.longitude,
  //   };
  // });

  // const infowindow = new google.maps.InfoWindow();
  // document.getElementById("submit").addEventListener("click", () => {
  //   geocodeLatLng(geocoder, map, infowindow, currentLocation);
  // });

  // map = new google.maps.Map(document.getElementById("map"), {});

  // map = new google.maps.Map(document.getElementById("map"), {
  //   zoom: 15,
  //   center: currentLocation,
  // });
  // new google.maps.Marker({
  //   map: map,
  //   position: currentLocation,
  // });

  // console.log(currentLocationName);

  // const onChangeHandler = function () {

  // };

  // console.log(currentLocationName);
  // const input = document.getElementById("input");
  // const searchBox = new google.maps.places.SearchBox(input);
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  // Bias the SearchBox results towards current map's viewport.
  // map.addListener("bounds_changed", () => {
  //   searchBox.setBounds(map.getBounds());
  // });
  // let markers = [];
  // // Listen for the event fired when the user selects a prediction and retrieve
  // // more details for that place.
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
  //     console.log(place.formatted_address);
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
