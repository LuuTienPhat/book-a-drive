let map, infoWindow;

async function initMap() {
  //   let pos = getCurrentPosition();
  //   console.log(pos);
  //   map = new google.maps.Map(document.getElementById("map"), {
  //     center: { lat: 10.762622, lng: 106.660172 },
  //     zoom: 10,
  //   });
  //   infoWindow = new google.maps.InfoWindow();
  //   const locationButton = document.createElement("button");
  //   locationButton.textContent = "Pan to Current Location";
  //   locationButton.classList.add("custom-map-control-button");
  //   map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
  //   locationButton.addEventListener("click", () => {
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // infoWindow.setPosition(pos);
        // infoWindow.setContent("Location found.");
        // infoWindow.open(map);
        map = new google.maps.Map(document.getElementById("map"), {
          center: pos,
          zoom: 15,
          disableDefaultUI: true,
        });
        new google.maps.Marker({
          position: pos,
          map: map,
        });
      },
      () => {
        handleLocationError(true, infoWindow, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  //   });
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

function getCurrentPosition() {
  let pos;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      //   infoWindow.setPosition(pos);
      //   infoWindow.setContent("Location found.");
      //   infoWindow.open(map);
      //   console.log(pos);
      return pos;
    },
    () => {
      handleLocationError(true, infoWindow, map.getCenter());
    }
  );
}
