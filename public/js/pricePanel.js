// const { default: axios } = require("axios");
const discount = 10 / 100;
const btnBook = document.getElementById("btn-book");
let driveId;

socket.on("SET_ID", (data) => {
  socket.userId = data;
});

socket.on("DRIVER_ON_THE_WAY", (data) => {
  const { driveId, driverId, driverLocation } = data;
  searchDriverModal.hide();
  driverPanel.classList.remove("d-none");
  pricePanel.classList.add("d-none");
  console.log(driverId);

  axios(`http://localhost:3001/drivers/${driverId}`)
    .then((res) => res.data)
    .then((data) => {
      console.log(data);
      driverDetail.innerHTML = `
          <h5 class=""><small>Tài xế: </small>${data.HOTX} ${data.TENTX}</h5>
          <div class="">
            <small class="fw-bolder">Phương tiện: </small> ${data.HANGXE} ${data.TENXE}
          </div>
          <div class="">
            <small class="fw-bolder">Biển số: </small> ${data.BIENKIEMSOAT}
          </div>
          <div class="">
            <small class="fw-bolder">Màu sắc:</small> ${data.MAUSAC}
          </div>`;
    });

  infoWindow.close();
  clearMarkers();

  calculateAndDisplayRoute(
    data.driverLocation,
    origin,
    directionsService,
    directionsRenderer,
    map
  );
});

btnBook.addEventListener("click", () => {
  axios
    .post("http://localhost:3001/list", {
      customerId: socket.userId,
      origin: origin,
      destination: destination,
      distance: distance,
      discount: price * discount,
      money: price,
    })
    .then((res) => res.data)
    .then((data) => {
      driveId = data;
      socket.emit("SEARCH_FOR_DRIVER", driveId);
    })
    .catch((err) => console.log(err));
});

cancelSearch.addEventListener("click", () => {
  socket.emit("STOP_SEARCH", driveId);
});
