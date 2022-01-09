const btnPickUp = document.getElementById("btn-pick-up");
const btnChoose = document.querySelector("#btn-choose");
const btnFinish = document.querySelector("#btn-finish");
const btnIsHere = document.querySelector("#btn-is-here");

const driveId = document.getElementById("driveId");
const customerOrigin = document.getElementById("origin");
const customerDestination = document.getElementById("destination");
const customerDistance = document.getElementById("distance");
const customerMoney = document.getElementById("money");
const receiveMoney = document.getElementById("receive-money");
let drive;

console.log(customerDistance.textContent);

socket.on("SET_ID", (data) => {
  socket.userId = data;
  // console.log(socket.userId);
  socket.driveId = driveId.textContent;
});

window.addEventListener("DOMContentLoaded", () => {
  socket.emit("GET_DRIVE_DATA", driveId.textContent);
});

socket.on("GIVE_DRIVE_DATA", (detail) => {
  drive = detail;
  // console.log(renderInvoice(drive));
});

socket.on("DRIVE_NO_LONGER_EXIST", () => {
  errorModal.show();
});

socket.emit("DRIVER_IS_WATCHING", driveId.textContent);

setTimeout(() => {
  clearMarkers();
  calculateAndDisplayRoute(
    customerOrigin.textContent,
    customerDestination.textContent,
    directionsService,
    directionsRenderer,
    map
  );
  clearInfoWindow();
}, 1000);

btnChoose.addEventListener("click", () => {
  origin = "10.802571619880212, 106.6432430486753";
  // console.log(socket.userId);
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
  btnIsHere.classList.remove("d-none");

  socket.emit("DRIVER_SET_STATE", 1);
});

btnIsHere.addEventListener("click", () => {
  socket.emit("DRIVER_IS_HERE", driveId.textContent);
});

btnPickUp.addEventListener("click", () => {
  calculateAndDisplayRoute(
    customerOrigin.textContent,
    customerDestination.textContent,
    directionsService,
    directionsRenderer,
    map
  );
  socket.emit("DRIVER_SET_STATE", 2);
  socket.emit("DRIVER_TAKE_CUSTOMER", driveId.textContent);
  btnPickUp.classList.add("d-none");
  btnIsHere.classList.add("d-none");
  btnFinish.classList.remove("d-none");
});

btnFinish.addEventListener("click", () => {
  document.querySelector("#invoice-modal .modal-body").innerHTML =
    renderInvoice(drive);
  invoiceModal.show();

  // socket.emit("SHOW_INVOICE");
  socket.emit("DRIVER_SET_STATE", 3);
});

receiveMoney.addEventListener("click", () => {
  socket.emit("FINISH", driveId.textContent);
  socket.emit("DRIVER_SET_STATE", 0);
  window.location.href = "/driver";
});

window.addEventListener("beforeunload", () => {
  socket.emit("DRIVER_IS_NOT_WATCHING", driveId.textContent);
});

const renderInvoice = (data) => {
  return `<div class="d-flex justify-content-between align-items-center">
                              <h6 class="my-0">${data.TENKH}</h6>
                              <div class="border border-2 border-primary rounded p-1">
                                <h6 class="my-0 text-primary">Tiền mặt</h6>
                              </div>
                            </div>
                            <hr />
                            <div class="d-flex flex-column align-items-center">
                              <div class="d-flex justify-content-between align-items-center w-100 mb-2">
                                <h5 class="my-0 text-secondary">Cước phí:</h5>
                                <h1 class="my-0 text-success">
                                  ${vietnamMoneyFormat(data.TIEN)}
                                </h1>
                              </div>
                              <div class="d-flex justify-content-between align-items-center w-100">
                                <h5 class="my-0 text-secondary">Khuyến mãi:</h5>
                                <h1 class="my-0 text-info">
                                  - ${vietnamMoneyFormat(0)}
                                </h1>
                              </div>
                            </div>
                            <hr />
                            <div class=" d-flex justify-content-between align-items-center w-100 mb-5 pb-3">
                              <h5 class="my-0">Tổng cộng:</h5>
                              <h1 class="my-0 text-primary">
                                ${vietnamMoneyFormat(data.TIEN)}
                              </h1>
                            </div>
                            <hr />
                            <div class="d-flex justify-content-between align-items-center">
                              <h6 class="my-0">Tài xế</h6>
                              <div class="border border-2 border-danger rounded p-1">
                                <h6 class="my-0 text-danger">Chiết khấu</h6>
                              </div>
                            </div>
                            <hr />
                            <div
                              class="d-flex justify-content-between align-items-center w-100"
                            >
                              <h5 class="my-0 text-secondary">Chiết khấu:</h5>
                              <h1 class="my-0 text-danger">
                              ${vietnamMoneyFormat(data.TIENCHIETKHAU)}
                              </h1>
                            </div>`;
};

const state0 = () => {};
const state1 = (data) => {
  origin = "10.802571619880212, 106.6432430486753";

  calculateAndDisplayRoute(
    origin,
    customerOrigin.textContent,
    directionsService,
    directionsRenderer,
    map
  );

  btnChoose.classList.add("d-none");
  btnPickUp.classList.remove("d-none");
  btnIsHere.classList.remove("d-none");

  // socket.emit("DRIVER_SET_STATE", 2);
};

const state2 = (data) => {
  calculateAndDisplayRoute(
    customerOrigin.textContent,
    customerDestination.textContent,
    directionsService,
    directionsRenderer,
    map
  );

  // socket.emit("DRIVER_IS_HERE", driveId.textContent);

  btnChoose.classList.add("d-none");
  btnFinish.classList.remove("d-none");
};

const state3 = (data) => {
  document.querySelector("#invoice-modal .modal-body").innerHTML =
    renderInvoice(drive);
  invoiceModal.show();
};

window.addEventListener("load", () => {
  socket.emit("DRIVER_GET_STATE");

  socket.on("DRIVER_SET_STATE", (state) => {
    if (state == 1) state1();
    if (state == 2) state2();
    if (state == 3) state3();
    if (state == 4) state4();
  });
});
