const discount = 10 / 100;
const btnBook = document.getElementById("btn-book");
const btnCancelDrive = document.getElementById("btn-cancel-drive");

let driveId;
// let state;

//LẤY CUSTOMER_ID
socket.on("SET_ID", (data) => {
  socket.userId = data;
});

//NHẤN NÚT ĐẶT XE THÌ THÔNG TIN CỦA CUỐC XE CŨNG NHƯ KHÁCH HÀNG SẼ ĐƯỢC GỬI LÊN SERVER
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
      socket.emit("CUSTOMER_SET_STATE", 1);
      socket.emit("SEARCH_FOR_DRIVER", driveId);
    })
    .catch((err) => console.log(err));
});

//KHÁCH HÀNG HUỶ TÌM KIẾM TÀI XẾ
cancelSearch.addEventListener("click", () => {
  socket.emit("STOP_SEARCH", driveId);
  socket.emit("CUSTOMER_SET_STATE", 0);
});

//THÔNG BÁO TÀI XẾ ĐANG TRÊN ĐƯỜNG ĐẾN ĐÂY
//HIỆN THÔNG TIN TÀI XẾ
socket.on("DRIVER_ON_THE_WAY", (data) => {
  const { driveId, driverId, driverLocation } = data;
  searchDriverModal.hide();
  driverPanel.classList.remove("d-none");
  pricePanel.classList.add("d-none");

  axios
    .all([
      axios.post(`http://localhost:3001/drivers`, {
        driverId: driverId,
      }),
      axios.post(`http://localhost:3001/vehicles/`, {
        driverId: driverId,
      }),
    ])

    .then((responseArr) => {
      return { ...responseArr[0].data, ...responseArr[1].data };
    })
    .then((data) => {
      driverDetail.innerHTML = `
          <h5 class=""><small>Tài xế: </small>${data.HOTX} ${data.TENTX}</h5>
          <div class="">
            <small class="fw-bolder">Số điện thoại: </small> ${data.SDT}
          </div>
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

  socket.emit("CUSTOMER_SET_STATE", 2);
});

//TÀI XẾ THÔNG BÁO ĐÃ ĐẾN NƠI
socket.on("DRIVER_IS_HERE", () => {
  notificationModal.show();
});

//KHÁCH HÀNG HUỶ ĐẶT XE
btnCancelDrive.addEventListener("click", () => {
  socket.emit("CUSTOMER_CANCEL_DRIVE");
  window.location.reload();
});

//TÀI XẾ HUỶ CHUYẾN THÌ THÔNG BÁO NÀY HIỆN RA
socket.on("DRIVE_NO_LONGER_EXIST", () => {
  cancelModal.show();
});

//THÔNG BÁO LOAD LẠI TRANG
socket.on("RELOAD_PAGE", () => {
  window.location.reload();
});

//TÀI XẾ HUỶ CHUYẾN
socket.on("DRIVER_CANCEL_DRIVE", () => {
  socket.emit("CUSTOMER_SET_STATE", 0);
  cancelModal.show();
});

//TRẠNG THÁI 0 KHI KHÁCH HÀNG CHƯA ĐẶT XE
const state0 = () => {};

//TRẠNG THÁI 1 KHI KHÁCH HÀNG ĐÃ ĐẶT XE VÀ ĐANG TÌM KIẾM TÀI XẾ
const state1 = (data) => {
  historyPanel.classList.add("d-none");
  searchBar.classList.add("d-none");
  pricePanel.classList.remove("d-none");

  console.log(data);
  driveId = data.MACHUYEN;
  calculateAndDisplayRoute(
    data.DIEMDEN,
    data.DIEMDON,
    directionsService,
    directionsRenderer,
    map
  );

  searchDriverModal.show();
};

//TRẠNG THÁI 2 CÓ TÀI XẾ ĐỒNG Ý NHẬN CUỐC VÀ ĐANG TRÊN ĐƯỜNG ĐẾN
const state2 = (data1) => {
  // console.log(data1);
  historyPanel.classList.add("d-none");
  searchBar.classList.add("d-none");
  driverPanel.classList.remove("d-none");

  axios
    .all([
      axios.post(`http://localhost:3001/drivers`, {
        driverId: data1.MATX,
      }),
      axios.post(`http://localhost:3001/vehicles/`, {
        driverId: data1.MATX,
      }),
    ])

    .then((responseArr) => {
      return { ...responseArr[0].data, ...responseArr[1].data };
    })
    .then((data) => {
      driverDetail.innerHTML = `
          <h5 class=""><small>Tài xế: </small>${data.HOTX} ${data.TENTX}</h5>
          <div class="">
            <small class="fw-bolder">Số điện thoại: </small> ${data.SDT}
          </div>
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

  // infoWindow.close();
  clearMarkers();
  clearInfoWindow();
  calculateAndDisplayRoute(
    data.VITRITAIXE,
    data.DIEMDON,
    directionsService,
    directionsRenderer,
    map
  );
};

window.addEventListener("load", () => {
  socket.emit("CUSTOMER_GET_STATE");

  socket.on("CUSTOMER_SET_STATE", (data) => {
    if (data.state == 1) state1(data.data);
    if (data.state == 2) state2(data.data);
  });
});

// window.addEventListener("beforeunload", (e) => {
//   navigator.sendBeacon("http://www.google.it");
//   window.alert("Are u sure");
//   e.preventDefault();
//   e.returnValue = ``;
// });
