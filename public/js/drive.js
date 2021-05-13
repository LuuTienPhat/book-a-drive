const btnPickUp = document.getElementById("btn-pick-up");
const btnChoose = document.querySelector("#btn-choose");
const btnFinish = document.querySelector("#btn-finish");
const btnNotChoose = document.querySelector("#btn-not-choose");

const driveId = document.getElementById("driveId");
const customerOrigin = document.getElementById("origin");
const customerDestination = document.getElementById("destination");
const customerDistance = document.getElementById("distance");
const customerMoney = document.getElementById("money");

socket.on("SET_ID", (data) => {
  socket.userId = data;
  socket.driveId = driveId.textContent;
});

socket.emit("DRIVER_IS_WATCHING", driveId.textContent);

setTimeout(() => {
  calculateAndDisplayRoute(
    customerOrigin.textContent,
    customerDestination.textContent,
    directionsService,
    directionsRenderer,
    map
  );
}, 1000);

btnChoose.addEventListener("click", () => {
  origin = "10.802571619880212, 106.6432430486753";
  console.log(driveId);
  socket.emit("DRIVER_HAS_CHOSEN", {
    driveId: driveId.textContent,
    driverId: socket.userId,
    driverLocation: origin,
  });

  calculateAndDisplayRoute(
    origin,
    customerOrigin.textContent,
    directionsService,
    directionsRenderer,
    map
  );

  btnChoose.classList.add("d-none");
  btnPickUp.classList.remove("d-none");
  btnNotChoose.classList.remove("d-none");
});

btnPickUp.addEventListener("click", () => {
  // origin = "10.835707789445106, 106.6586655182886";

  calculateAndDisplayRoute(
    customerOrigin.textContent,
    customerDestination.textContent,
    directionsService,
    directionsRenderer,
    map
  );

  btnPickUp.classList.add("d-none");
  btnNotChoose.classList.add("d-none");
  btnFinish.classList.remove("d-none");
});

btnFinish.addEventListener("click", () => {
  socket.emit("FINISH", driveId.textContent);
  window.location.href = "/driver";
});

socket.on("DRIVE_NO_LONGER_EXIST", () => {
  errorModal.show();
});

window.addEventListener("beforeunload", () => {
  socket.emit("DRIVER_IS_NOT_WATCHING", driveId.textContent);
});
