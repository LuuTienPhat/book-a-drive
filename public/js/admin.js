moment.locale("vi");
const dateClock = document.getElementById("date-clock");
const btnAccept = document.getElementById("btn-accept");
const btnNext = document.querySelectorAll("#btn-next");
const btnBack = document.querySelectorAll("#btn-back");
const btnCancel = document.querySelectorAll("#btn-cancel");
const adminConfirmPanel = document.getElementById("admin-confirm-panel");
const driverInformationPanel = document.getElementById(
  "driver-information-panel"
);
const driverAccountPanel = document.getElementById("driver-account-panel");
const driverVehiclePanel = document.getElementById("driver-vehicle-panel");

const checkbox = document.getElementById("checkbox");
const country = document.getElementById("country");
const table = document.getElementById("table");

const homeTab = document.getElementById("home-tab");
const addDriverTab = document.getElementById("add-driver-tab");
const driverProfileTab = document.getElementById("driver-profile-tab");
const homePane = document.getElementById("home-pane");
const addDriverPane = document.getElementById("add-driver-pane");
const driverProfilePane = document.getElementById("driver-profile-pane");

const panes = document.querySelectorAll(".tab-pane");
const tabs = document.querySelectorAll(".nav-link");

let chartContainers = document.querySelectorAll(".chart-container");

const liveUpdate = setInterval(() => {
  dateClock.innerHTML = moment().format("dd DD/MM/YYYY HH:mm:ss");
}, 1000);

let paneTitle = document.getElementById("pane-title");

lastname.addEventListener("input", checkLastname);
firstname.addEventListener("input", checkFirstName);
gender.addEventListener("change", checkGender);
birthday.addEventListener("input", checkBirthday);
identityNumber.addEventListener("input", checkIdentityNumber);
email.addEventListener("input", checkEmail);
phone.addEventListener("input", checkPhone);
address.addEventListener("input", checkAddress);
country.addEventListener("input", checkCountry);
username.addEventListener("input", checkUsernameDriver);
password.addEventListener("input", checkPassword);
passwordRepeat.addEventListener("input", checkPasswordRepeat);
vehicleBrand.addEventListener("input", checkVehicleBrand);
vehicleName.addEventListener("input", checkVehicleName);
licensePlate.addEventListener("input", checkLicensePlate);
vehicleColor.addEventListener("input", checkVehicleColor);

const addDriverState = [
  adminConfirmPanel,
  driverInformationPanel,
  driverAccountPanel,
  driverVehiclePanel,
];

let choosenDriverId;
let editDriver = 0;
let currentDriverState;

tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    if (currentDriverState > 0) {
      warningModal.show();
    } else if (editDriver > 0) {
      warningModal.show();
    } else {
      tabs.forEach((tab1) => {
        if (tab1.dataset.tab == tab.dataset.tab) {
          tab1.classList.add("active");
        } else {
          tab1.classList.remove("active");
        }
      });
      panes.forEach((pane) => {
        if (pane.dataset.pane == tab.dataset.tab) {
          if (pane.dataset.pane == 0) {
            paneTitle.innerHTML = "Danh sách các tài xế";
          } else if (pane.dataset.pane == 1) {
            paneTitle.innerHTML = "Thêm tài xế";
          } else if (pane.dataset.pane == 3) {
            paneTitle.innerHTML = "Thêm nhân viên";
          } else if (pane.dataset.pane == 4) {
            paneTitle.innerHTML = "Thông tin nhân viên";
          }
          pane.classList.add("d-flex");
          pane.classList.add("show");
          pane.classList.add("active");
          pane.classList.remove("d-none");
        } else {
          pane.classList.remove("d-flex");
          pane.classList.remove("show");
          pane.classList.remove("active");
          pane.classList.add("d-none");
        }
      });
    }
  });
});

btnAccept.addEventListener("click", () => {
  currentDriverState = 0;
  addDriverState[currentDriverState].classList.add("d-none");
  currentDriverState++;
  addDriverState[currentDriverState].classList.remove("d-none");
});

btnNext.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.state == 1) {
      checkLastname();
      checkFirstName();
      checkBirthday();
      checkGender();
      checkIdentityNumber();
      checkPhone();
      checkEmail();
      checkAddress();
      checkCountry();

      if (!firstname.classList.contains("is-valid")) return;
      if (!lastname.classList.contains("is-valid")) return;
      if (!birthday.classList.contains("is-valid")) return;
      if (!gender.classList.contains("is-valid")) return;
      if (!identityNumber.classList.contains("is-valid")) return;
      if (!email.classList.contains("is-valid")) return;
      if (!phone.classList.contains("is-valid")) return;
      if (!address.classList.contains("is-valid")) return;
      if (!country.classList.contains("is-valid")) return;
    }

    if (button.dataset.state == 2) {
      checkUsernameDriver();
      checkPassword();
      checkPasswordRepeat();

      if (!username.classList.contains("is-valid")) return;
      if (!password.classList.contains("is-valid")) return;
      if (!passwordRepeat.classList.contains("is-valid")) return;
    }

    if (button.dataset.state == 3) {
      checkVehicleBrand();
      checkVehicleName();
      checkLicensePlate();
      checkVehicleColor();

      if (!vehicleBrand.classList.contains("is-valid")) return;
      if (!vehicleName.classList.contains("is-valid")) return;
      if (!licensePlate.classList.contains("is-valid")) return;
      if (!vehicleColor.classList.contains("is-valid")) return;
    }

    if (currentDriverState <= 2) {
      addDriverState[currentDriverState].classList.add("d-none");
      currentDriverState++;
      addDriverState[currentDriverState].classList.remove("d-none");
    } else {
      addDriver();
      successModal.show();
    }
  });
});

btnBack.forEach((button) => {
  button.addEventListener("click", () => {
    addDriverState[currentDriverState].classList.add("d-none");
    currentDriverState--;
    if (currentDriverState == 0) window.location.reload();
    else addDriverState[currentDriverState].classList.remove("d-none");
  });
});

btnCancel.forEach((button) => {
  button.addEventListener("click", () => {
    warningModal.show();
  });
});

const addDriver = () => {
  axios
    .put(`http://localhost:3001/drivers`, {
      lastname: lastname.value,
      firstname: firstname.value,
      gender: gender.value,
      birthday: birthday.value || "11/12/2000",
      identityNumber: identityNumber.value,
      email: email.value,
      phone: phone.value,
      address: address.value,
      country: country.value,
    })
    .then((res) => res.data.driverId)
    .then((driverId) => {
      axios
        .all([
          axios.put("http://localhost:3001/accounts/drivers", {
            driverId: driverId,
            username: username.value || "string" + Math.random(),
            password: password.value || "12345",
          }),
          axios.put("http://localhost:3001/vehicles/", {
            driverId: driverId,
            vehicleBrand: vehicleBrand.value,
            vehicleName: vehicleName.value,
            licensePlate: licensePlate.value,
            vehicleColor: vehicleColor.value,
          }),
          axios.put("http://localhost:3001/wallets", {
            driverId: driverId,
            lastname: lastname.value,
            firstname: firstname.value,
          }),
        ])
        .then((responseArr) => {
          if (
            responseArr[0].status == 200 &&
            responseArr[1].status == 200 &&
            responseArr[2].status == 200
          ) {
            console.log("ADD DRIVER SUCCESSFUL");
          }
        });
    });
};

checkbox.addEventListener("change", () => {
  btnAccept.disabled = !btnAccept.disabled;
});

const renderTotalDriver = (totalDriver, totalDriverOnline) => {
  const total = document.getElementById("total");
  total.innerHTML = `<p class="m-0 me-2 border border-2 border-primary p-2 rounded">Tổng tài xế: 
                    <span class="h5 text-primary" id="total-driver">${totalDriver}</span>
                  </p>
                  <p class="m-0 border border-2 border-success p-2 rounded">Tài xế đang online: 
                    <span class="h5 text-success" id>${totalDriverOnline}</span>
                  </p>`;
};

const btnDriverProfileClicked = (driverId) => {
  choosenDriverId = driverId;
  console.log(choosenDriverId);
  panes.forEach((pane) => {
    if (pane.dataset.pane == 2) {
      pane.classList.add("d-flex");
      pane.classList.add("show");
      pane.classList.add("active");
      pane.classList.remove("d-none");
      paneTitle.innerHTML = "Chi tiết tài xế";

      tabs[0].classList.remove("active");
    } else {
      pane.classList.remove("d-flex");
      pane.classList.remove("show");
      pane.classList.remove("active");
      pane.classList.add("d-none");
    }
  });

  renderDriverProfile(driverId, provincesList);
  renderVehicleProfile(driverId);

  deleteCanvas();
  appendChart();
  initChart(driverId);
  initHistory(driverId);
};

//HIỆN RA CÁC THÔNG TIN CỦA TÀI XẾ ĐÓ
const renderDriverProfile = (driverId, provincesList) => {
  const removeAccents = (str) => {
    var AccentsMap = [
      "aàảãáạăằẳẵắặâầẩẫấậ",
      "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
      "dđ",
      "DĐ",
      "eèẻẽéẹêềểễếệ",
      "EÈẺẼÉẸÊỀỂỄẾỆ",
      "iìỉĩíị",
      "IÌỈĨÍỊ",
      "oòỏõóọôồổỗốộơờởỡớợ",
      "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
      "uùủũúụưừửữứự",
      "UÙỦŨÚỤƯỪỬỮỨỰ",
      "yỳỷỹýỵ",
      "YỲỶỸÝỴ",
    ];
    for (var i = 0; i < AccentsMap.length; i++) {
      var re = new RegExp("[" + AccentsMap[i].substr(1) + "]", "g");
      var char = AccentsMap[i][0];
      str = str.replace(re, char);
    }
    return str;
  };

  const driverForm = document.getElementById("driver-form");
  axios
    .post(`http://localhost:3001/drivers`, { driverId: driverId })
    .then((res) => res.data)
    .then((data) => {
      return (driverForm.innerHTML = `<div class="col-3 d-flex flex-column align-items-center justify-content-start px-2">
                                          <h5 class="m-0 mb-4">Thông tin tài xế</h5>
                                           <img class="bg-secondary rounded-circle mt-2" style="height: 120px; width: 120px" src="https://picsum.photos/600/600"/>
                                        </div>
                                        <div class="col-3 px-3">
                                          <div class="row mb-3">
                                            <label for="inputFirstname4" class="form-label">Họ</label>
                                            <input type="text" class="form-control input1" id="lastname1" placeholder="Nguyễn Văn" 
                                            value = "${data.HOTX}"
                                            disabled
                                            />
                                            <div class="invalid-feedback" id="lastname-warning1"></div>
                                          </div>
                                          <div class="row mb-3">
                                            <label for="inputPassword4" class="form-label">Tên</label>
                                            <input type="text" class="form-control input1" id="firstname1" placeholder="A" 
                                            value = "${data.TENTX}"
                                            disabled
                                            />
                                            <div class="invalid-feedback" id="firstname-warning1"></div>
                                          </div>
                                          <div class="row">
                                            <label for="inputState" class="form-label">Giới tính</label>
                                            <select id="gender1" class="form-select input1" disabled>
                                              <option></option>
                                              <option ${
                                                removeAccents(
                                                  data.GIOITINH.trim()
                                                ) == "Nu"
                                                  ? "selected"
                                                  : ""
                                              }>Nữ</option>
                                              <option ${
                                                data.GIOITINH == "Nam"
                                                  ? "selected"
                                                  : ""
                                              }>Nam</option>
                                              
                                            </select>
                                            <div class="invalid-feedback" id="gender-warning1"></div>
                                          </div>
                                        </div>
                                        <div class="col-3 px-3">
                                          <div class="row mb-3">
                                            <label for="inputFirstname4" class="form-label">Ngày sinh</label>
                                            <input type="text" class="form-control input1" id="birthday1" placeholder="31/12/2012" 
                                            value = "${moment(
                                              data.NGAYSINH
                                            ).format("DD/MM/YYYY")}"
                                            disabled
                                            />
                                            <div class="invalid-feedback" id="birthday-warning1"></div>
                                          </div>
                                          <div class="row mb-3">
                                            <label for="inputPassword4" class="form-label">Số CMND/ CCCD</label>
                                            <input type="text" class="form-control" id="identity-number1" 
                                            value = "${data.CMND}"
                                            disabled
                                            disabled
                                            />
                                            <div class="invalid-feedback" id="identity-number-warning1"></div>
                                          </div>
                                          <div class="row">
                                            <label for="country" class="form-label">Quê quán</label>
                                            <select id="country1" class="form-select input1" disabled>
                                              <option selected="selected"></option>
                                              ${provincesList.map(
                                                (province) => {
                                                  if (
                                                    data.QUEQUAN ==
                                                    province.name
                                                  )
                                                    return `<option selected>${province.name}</option>`;
                                                  else
                                                    return `<option>${province.name}</option>`;
                                                }
                                              )}
                                            </select>
                                            <div class="invalid-feedback" id="country-warning1"></div>
                                          </div>
                                        </div>
                                        <div class="col-3 px-3">
                                          <div class="row mb-3">
                                            <label for="inputEmail4" class="form-label">Email</label>
                                            <input type="email" class="form-control input1" id="email1" placeholder="example@gmail.com" 
                                            value = "${data.EMAIL}" 
                                            disabled
                                            />
                                            <div class="invalid-feedback" id="email-warning1"></div>
                                          </div>
                                          <div class="row mb-3">
                                            <label for="inputAddress" class="form-label">Số điện thoại</label>
                                            <input type="text" class="form-control input1" id="phone1" placeholder="0123456789" 
                                            value = "${data.SDT}" 
                                            disabled
                                            />
                                            <div class="invalid-feedback" id="phone-warning1"></div>
                                          </div>
                                          <div class="row mb-3">
                                            <label for="inputAddress" class="form-label">Địa chỉ</label>
                                            <input type="text" class="form-control input1" id="address1" placeholder="97 Nguyễn Kiệm..." 
                                            value = "${data.DIACHI}" 
                                            disabled
                                            />
                                            <div class="invalid-feedback" id="address-warning1"></div>
                                          </div>
                                        </div>`);
    })
    .catch((err) => console.log(err));
};

//HIỆN RA THÔNG TIN CỦA XE CỦA TÀI XẾ ĐÓ
const renderVehicleProfile = (driverId) => {
  const vehicleForm = document.getElementById("vehicle-form");
  axios
    .post(`http://localhost:3001/vehicles/`, {
      driverId: driverId,
    })
    .then((res) => res.data)
    .then((data) => {
      console.log(data);
      vehicleForm.innerHTML = `<div class="row">
                            <div class="col-6 mb-3">
                              <label for="vehicle-brand" class="form-label">Hãng xe</label>
                              <input
                                type="text"
                                class="form-control border border-3 input1"
                                id="vehicle-brand1"
                                name="vehicle-brand"
                                value="${data.HANGXE}"
                                required
                                disabled
                              />
                            </div>

                            <div class="col-6 mb-3">
                              <label for="vehicle-name" class="form-label">Tên xe</label>
                              <input
                                type="text"
                                class="form-control border border-3 input1"
                                id="vehicle-name1"
                                name="vehicle-name"
                                value="${data.TENXE}"
                                required
                                disabled
                              />
                            </div>

                            <div class="col-6">
                              <label for="license-plate" class="form-label">Biển kiểm soát</label>
                              <div class="input-group has-validation">
                                <input
                                  type="text"
                                  class="form-control border border-3 input1"
                                  id="license-plate1"
                                  name="license-plate"
                                  value="${data.BIENKIEMSOAT}"
                                  required
                                  disabled
                                />
                                <div class="invalid-feedback" id="license-plate-warning"></div>
                              </div>
                            </div>

                            <div class="col-6">
                              <label for="vehicle-color" class="form-label">Màu sắc</label>
                              <div class="input-group has-validation">
                                <input
                                  type="text"
                                  class="form-control border border-3 input1"
                                  id="vehicle-color1"
                                  name="vehicle-color"
                                  value="${data.MAUSAC}"
                                  required
                                  disabled
                                />
                                <div class="invalid-feedback" id="vehicle-color-warning"></div>
                              </div>
                            </div>
                          </div>`;
    })
    .catch((err) => console.log(err));
};

//HIỆN LỊCH SỬ ĐI LẠI CỦA TÀI XẾ ĐÓ
const initHistory = (driverId) => {
  const swiper = new Swiper(".mySwiper", {
    initialSlide: 60,
    slidesPerView: 6,
    spaceBetween: 5,
    slidesPerGroup: 3,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  moment.locale("vi");
  const historyPanel = document.getElementById("history-panel");
  const moneyPanel = document.getElementById("money-panel");
  const vietnamMoneyFormat = (number) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formatter.format(number);
  };

  const kilometerFormat = (number) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "unit",
      unit: "kilometer",
    });
    return formatter.format(number);
  };

  // function init() {

  const getDriverId = () => {
    return new Promise((resolve) => {
      socket.on("SET_ID", (data) => {
        resolve(data);
      });
    });
  };

  // socket.driverId = await getDriverId();
  const renderSwiper = (() => {
    let map = [];

    for (let i = 60; i >= 0; i--) {
      map.push(
        `<div class="swiper-slide text-dark border border-secondary border-2 rounded"
                style="text-align: center;
                      font-size: 14px;
                      background: #fff;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;"
            data-date="${moment()
              .subtract(i, "days")
              .utc(7)
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .toISOString()}"
            data-key="${i}"
            id="btn-show-history"
        >
            <div><b>${moment().subtract(i, "days").format("dd")}</b></div>
            <div><b>${moment().subtract(i, "days").format("DD/MM")}</b></div>
        </div>`
      );
    }
    let result = map.join("");
    document.getElementById("swiper-wrapper").innerHTML = result;
    swiper.update();
  })(); // run when load

  const renderHistory = (data) => {
    const result = data.map((each) => {
      // console.log(moment.utc(each.GIODATXE).format("HH:mm"));
      return `<div
                    class="d-flex justify-content-center align-items-center py-2 px-2 border border-2 border-success rounded mb-1"
                    id="place-item"
                    data-drive="${each.MACHUYEN}"
                    >
                    <div class="pe-2 overflow-hidden w-100">
                        <h5 class="text-truncate">
                            ${each.DIEMDEN}
                        </h5>
                        <div class="d-flex justify-content-start align-items-center">
                        <p
                            class="text-truncate text-secondary my-0"
                            style="font-size: 14px"
                        >
                            <i class="bi bi-align-center"></i>
                            ${kilometerFormat(each.QUANGDUONG)}
                        </p>
                        <p
                            class="text-truncate text-secondary mx-1 my-0"
                            style="font-size: 14px"
                        >
                            <i class="bi bi-clock-fill"></i>
                            ${moment.utc(each.GIODATXE).format("HH:mm")}
                        </p>
                        <p
                            class="text-truncate text-secondary mx-1 my-0"
                            style="font-size: 14px"
                        >
                            <i class="bi bi-wallet-fill"></i>
                            ${vietnamMoneyFormat(each.TIENCHIETKHAU)}
                        </p>
                        </div>
                    </div>
                    <div class="d-flex flex-column justify-content-center">
                        <div class="text-secondary text-nowrap" style="font-size: 14px">
                        <i class="bi bi-cash"></i> Tiền
                        </div>
                        <h4 class="my-0 text-success text-nowrap text-end">
                            ${vietnamMoneyFormat(each.TIEN)}
                        </h4>
                    </div>
                    </div>`;
    });
    historyPanel.innerHTML = result.join("");
  };

  const renderTotal = (data, dateForSeacrh) => {
    let totalMoney = 0,
      totalDiscount = 0,
      totalDrive = 0;
    for (let i = 0; i < data.length; i++) {
      totalMoney += data[i].TIEN;
      totalDiscount += data[i].TIENCHIETKHAU;
    }
    moneyPanel.innerHTML = `<div
                              class="d-flex justify-content-center align-items-center py-3 px-3 border border-3 border-danger rounded"
                              id="place-item"
                              data-address=""
                          >
                              <div class="overflow-hidden w-100">
                              <h5 class="text-truncate text-primary">
                                  ${
                                    data.length == 0
                                      ? moment(dateForSeacrh).format(
                                          "dd DD/MM/YYYY"
                                        )
                                      : moment(data[0].NGAYDATXE).format(
                                          "dd DD/MM/YYYY"
                                        )
                                  }
                              </h5>
                              <div class="d-flex flex-column justify-content-center">
                                  <p
                                  class="text-truncate text-success my-0"
                                  style="font-size: 16px"
                                  >
                                  <i class="bi bi-check2-circle"></i>
                                      ${data.length} đã hoàn thành
                                  </p>
                                  <p
                                  class="text-truncate text-danger my-0"
                                  style="font-size: 16px"
                                  >
                                  <i class="bi bi-wallet-fill"></i>
                                      ${vietnamMoneyFormat(totalDiscount)}
                                  </p>
                              </div>
                              </div>
                              <div class="d-flex flex-column justify-content-center">
                              <div class="text-secondary text-nowrap">
                                  <i class="bi bi-cash"></i> Thu nhập
                              </div>
                                  <h4 class="my-0 text-danger text-nowrap text-end">
                                  ${vietnamMoneyFormat(totalMoney)}
                                  </h4>
                              </div>
                          </div>`;
  };

  const buttons = document.querySelectorAll("#btn-show-history");
  // console.log(buttons);
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const date = button.dataset.date;
      // const driverId = socket.driverId;
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].dataset.key == button.dataset.key) {
          buttons[i].classList.remove("border-secondary");
          buttons[i].classList.add("border-primary");
        } else {
          buttons[i].classList.add("border-secondary");
          buttons[i].classList.remove("border-primary");
        }
      }
      axios
        .get(`http://localhost:3001/drives?driverId=${driverId}&&date=${date}`)
        .then((res) => {
          return res.data;
        })
        .then((data) => {
          renderHistory(data);
          renderTotal(data, date);
        });
    });
  });

  buttons[buttons.length - 1].click();
};

//BẢNG THỐNG KÊ
const driveChart = document.getElementById("drive-chart");
const incomeChart = document.getElementById("income-chart");

const deleteCanvas = () => {
  incomeChart.remove();
  driveChart.remove();
};

const appendChart = () => {
  chartContainers[0].innerHTML =
    '<canvas id="income-chart" style="height: 100%; width: 100%;"></canvas>';

  chartContainers[1].innerHTML =
    '<canvas id="drive-chart" style="height: 100%; width: 100%;"></canvas>';
};

let chart1, chart2;
const initChart = (driverId) => {
  const driveChart = document.getElementById("drive-chart");
  const incomeChart = document.getElementById("income-chart");

  let firstDayOfWeek = moment()
    .isoWeekday(1)
    .utc(7)
    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  // console.log(firstDayOfWeek.toISOString())
  let labels = [];
  for (let i = 0; i < 7; i++) {
    labels.push(firstDayOfWeek.clone().add(i, "days").format("DD/MM"));
  }

  const dateStart = moment.utc(firstDayOfWeek).toISOString();
  const dateEnd = firstDayOfWeek.clone().add(6, "days").toISOString();
  axios
    .get(
      `http://localhost:3001/drives?driverId=${driverId}&&dateStart=${dateStart}&&dateEnd=${dateEnd}`
    )
    .then((res) => res.data)
    .then((data) => {
      const lastDayOfWeek = firstDayOfWeek.clone().add(6, "days");

      let chartData = [];
      let incomeData = [];
      while (moment(firstDayOfWeek).isSameOrBefore(lastDayOfWeek)) {
        let count = 0;
        let money = 0;
        for (let i = 0; i < data.length; i++) {
          if (moment(data[i].NGAYDATXE).isSame(firstDayOfWeek)) {
            count++;
            money += data[i].TIEN;
          }
        }
        firstDayOfWeek.add(1, "days");
        incomeData.push(money);
        chartData.push(count);
      }

      firstDayOfWeek = moment()
        .isoWeekday(1)
        .utc(7)
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

      let chart1 = new Chart(driveChart, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Cuốc xe đã chạy trong tuần",
              data: chartData,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132, 0.5)",
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "rgb(255, 99, 132)",
              },
            },
            title: {
              display: true,
              text: `Số cuốc xe tài xế đã chạy từ ${labels[0]} đến ${labels[6]}`,
            },
          },
        },
      });

      let chart2 = new Chart(incomeChart, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Thu nhập trong tuần",
              data: incomeData,
              borderColor: "rgba(255, 159, 64, 0.2)",
              backgroundColor: "rgb(255, 159, 64)",
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "rgb(255, 159, 64)",
              },
            },
            title: {
              display: true,
              text: `Thu nhập trong tuần từ ${labels[0]} đến ${labels[6]}`,
            },
          },
        },
      });
    });
};

//3 NÚT ĐIỂU KHIỂN TRONG SỬA TÀI XẾ
const btnCancelUser = document.getElementById("btn-cancel-user");
const btnSaveUser = document.getElementById("btn-save-user");
const btnChangeUser = document.getElementById("btn-change-user");

let a;
btnChangeUser.addEventListener("click", () => {
  editDriver = 1;
  a = document.querySelectorAll(".input1");
  console.log("Thay đổi tài khoản");
  console.log(a);
  for (let i = 0; i < a.length; i++) {
    a[i].disabled = !a[i].disabled;
  }

  btnChangeUser.classList.add("d-none");
  btnSaveUser.classList.remove("d-none");
  btnCancelUser.classList.remove("d-none");
});

btnSaveUser.addEventListener("click", () => {
  checkLastname1(
    document.getElementById("lastname1"),
    document.getElementById("lastname-warning1")
  );
  checkFirstName1(
    document.getElementById("firstname1"),
    document.getElementById("firstname-warning1")
  );
  checkEmail1(
    document.getElementById("email1"),
    document.getElementById("email-warning1")
  );
  checkPhone1(
    document.getElementById("phone1"),
    document.getElementById("phone-warning1")
  );
  checkCountry1(
    document.getElementById("country1"),
    document.getElementById("country-warning1")
  );
  checkBirthday1(
    document.getElementById("birthday1"),
    document.getElementById("birthday-warning1")
  );
  // checkIdentityNumber1(
  //   document.getElementById("identity-number1"),
  //   document.getElementById("identity-number-warning1")
  // );
  checkGender1(
    document.getElementById("gender1"),
    document.getElementById("gender-warning1")
  );
  checkAddress1(
    document.getElementById("address1"),
    document.getElementById("address-warning1")
  );
  checkVehicleBrand1(
    document.getElementById("vehicle-brand1"),
    document.getElementById("vehicle-brand-warning1")
  );
  checkVehicleName1(
    document.getElementById("vehicle-name1"),
    document.getElementById("vehicle-name-warning1")
  );
  checkVehicleColor1(
    document.getElementById("vehicle-color1"),
    document.getElementById("vehicle-color-warning1")
  );
  checkLicensePlate1(
    document.getElementById("license-plate1"),
    document.getElementById("license-plate-warning1")
  );

  if (!document.getElementById("lastname1").classList.contains("is-valid"))
    return;
  if (!document.getElementById("firstname1").classList.contains("is-valid"))
    return;
  if (!document.getElementById("email1").classList.contains("is-valid")) return;
  if (!document.getElementById("phone1").classList.contains("is-valid")) return;
  if (!document.getElementById("country1").classList.contains("is-valid"))
    return;
  if (!document.getElementById("birthday1").classList.contains("is-valid"))
    return;
  // if (
  //   !document.getElementById("identity-number1").classList.contains("is-valid")
  // )
  //   return;
  if (!document.getElementById("gender1").classList.contains("is-valid"))
    return;
  if (!document.getElementById("address1").classList.contains("is-valid"))
    return;

  if (!document.getElementById("vehicle-brand1").classList.contains("is-valid"))
    return;
  if (!document.getElementById("vehicle-name1").classList.contains("is-valid"))
    return;
  if (!document.getElementById("vehicle-color1").classList.contains("is-valid"))
    return;
  if (!document.getElementById("license-plate1").classList.contains("is-valid"))
    return;
  console.log(choosenDriverId);
  axios
    .all([
      axios.patch("http://localhost:3001/drivers", {
        driverId: choosenDriverId,
        lastname: document.getElementById("lastname1").value.trim(),
        firstname: document.getElementById("firstname1").value.trim(),
        gender: document.getElementById("gender1").value.trim(),
        birthday: document.getElementById("birthday1").value.trim(),
        email: document.getElementById("email1").value.trim(),
        phone: document.getElementById("phone1").value.trim(),
        address: document.getElementById("address1").value.trim(),
        country: document.getElementById("country1").value.trim(),
      }),
      axios.patch("http://localhost:3001/vehicles", {
        driverId: choosenDriverId,
        vehicleBrand: document.getElementById("vehicle-brand1").value.trim(),
        vehicleName: document.getElementById("vehicle-name1").value.trim(),
        licensePlate: document.getElementById("license-plate1").value.trim(),
        vehicleColor: document.getElementById("vehicle-color1").value.trim(),
      }),
    ])
    .then((responseArr) => {
      if (responseArr[0].data && responseArr[1].data) {
        console.log("Thành công");
        editSucessModal.show();
      } else {
        console.log("lỗi");
      }
    })
    .catch((err) => {
      console.log(err);
    });

  // window.location.reload();
});

btnCancelUser.addEventListener("click", () => {
  editDriver = 0;
  a = document.querySelectorAll(".input1");
  for (let i = 0; i < a.length; i++) {
    a[i].disabled = !a[i].disabled;
  }

  window.location.reload();
});

//THÊM NHÂN VIÊN
const checkUsernameEmployee = (username, usernameWarning) => {
  if (username.value == "") {
    username.classList.add("is-invalid");
    usernameWarning.innerHTML = "Hãy nhập tên đăng nhập";
    return;
  }

  axios
    .post(`http://localhost:3001/accounts/employee/check`, {
      username: username.value,
    })
    .then((res) => res.data)
    .then((data) => {
      if (data.username) {
        usernameWarning.innerHTML = "Tên đăng nhập đã tồn tại";
        username.classList.add("is-invalid");
      } else {
        username.classList.add("is-valid");
        username.classList.remove("is-invalid");
      }
    });
};

const btnAddEmployee = document.getElementById("btn-add-employee");
btnAddEmployee.addEventListener("click", (e) => {
  console.log("clicked");
  const lastname = document.getElementById("e-lastname");
  const firstname = document.getElementById("e-firstname");
  const birthday = document.getElementById("e-birthday");
  const email = document.getElementById("e-email");
  const phone = document.getElementById("e-phone");
  const username = document.getElementById("e-username");
  const password = document.getElementById("e-password");
  const usernameWarning = document.getElementById("e-username-warning");

  // checkUsernameEmployee(username, usernameWarning);

  // if (!username.classList.contains("is-valid")) return;

  axios
    .put(`http://localhost:3001/employees`, {
      lastname: lastname.value,
      firstname: firstname.value,
      birthday: birthday.value,
      email: email.value,
      phone: phone.value,
    })
    .then((result) => result.data.employeeId)
    .then((employeeId) => {
      axios
        .put(`http://localhost:3001/accounts/employee`, {
          employeeId: employeeId,
          username: username.value,
          password: password.value,
        })
        .then((result) => {
          addSucessModal.show();
        });
    });
  //if (!result.error) addSucessModal.show();
});

//DANH SÁCH TỈNH
let provincesList;

axios
  .get("http://localhost:3001/provinces")
  .then((res) => res.data)
  .then((data) => {
    const { provinces } = data;
    provincesList = provinces;
    const result = provinces.map((province, index) => {
      return `<option>${province.name}</option>`;
    });
    country.innerHTML += result.join("");
  });

//THAY ĐỔI THÔNG TIN CỦA NHÂN VIÊN
const employeeChangeCurrentUsername = document.getElementById(
  "e-change-current-username"
);
const btnCancelChangeEmployeeUsername = document.getElementById(
  "btn-e-cancel-change-username"
);
const employeeChangeUsername = document.getElementById("e-change-username");
const employeeChangeUsernameWarning = document.getElementById(
  "e-change-username-warning"
);
const btnChangeEmployeeUserName = document.getElementById(
  "btn-e-change-username"
);

employeeChangeUsername.addEventListener("input", () =>
  checkUsernameEmployee(employeeChangeUsername, employeeChangeUsernameWarning)
);

btnChangeEmployeeUserName.addEventListener("click", (e) => {
  checkUsernameEmployee(employeeChangeUsername, employeeChangeUsernameWarning);
  if (!employeeChangeUsername.classList.contains("is-valid")) return;

  axios
    .patch(`http://localhost:3001/accounts/employee`, {
      employeeId: employeeId,
      username: employeeChangeUsername.value.trim(),
    })
    .then((result) => {
      if (!result.error) {
        usernameModal.hide();
        employeeChangeCurrentUsername.value = employeeChangeUsername.value;
        employeeChangeUsername.value = "";
      }
    });
});

btnCancelChangeEmployeeUsername.addEventListener("click", () => {
  employeeChangeUsername.value = "";
});

//THAY ĐỔI MẬT KHẨU CỦA NHÂN VIÊN
const btnChangeEmployeePassword = document.getElementById(
  "btn-e-change-password"
);

const employeeChangeOldPassword = document.getElementById(
  "e-change-old-password"
);
const employeeChangeOldPasswordWarning = document.getElementById(
  "e-change-old-password-warning"
);

const employeeChangePassword = document.getElementById("e-change-password");
const employeeChangePasswordWarning = document.getElementById(
  "e-change-password-warning"
);

const employeeChangePasswordRepeat = document.getElementById(
  "e-change-password-repeat"
);
const employeeChangePasswordRepeatWarning = document.getElementById(
  "e-change-password-repeat-warning"
);

const btnCancelChangeEmployeePassword = document.getElementById(
  "btn-e-cancel-change-password"
);

const checkOldPasswordEmployee = (
  employeeId,
  currentUsername,
  oldPassword,
  oldPasswordWarning
) => {
  if (oldPassword.value == "") {
    oldPassword.classList.remove("is-valid");
    oldPassword.classList.add("is-invalid");
    oldPasswordWarning.innerHTML = "Không được để trống";
    return;
  }

  axios
    .post("http://localhost:3001/accounts/employee/check", {
      employeeId: employeeId,
      username: currentUsername.value.trim(),
      password: oldPassword.value,
    })
    .then((res) => res.data)
    .then((data) => {
      console.log(data);
      if (data.password) {
        oldPassword.classList.add("is-valid");
        oldPassword.classList.remove("is-invalid");
      } else {
        oldPassword.classList.remove("is-valid");
        oldPassword.classList.add("is-invalid");
        oldPasswordWarning.innerHTML = "Mật khẩu cũ không đúng";
      }
    });
};

employeeChangeOldPassword.addEventListener("input", () =>
  checkOldPasswordEmployee(
    employeeId,
    employeeChangeCurrentUsername,
    employeeChangeOldPassword,
    employeeChangeOldPasswordWarning
  )
);

employeeChangePassword.addEventListener("input", () =>
  checkPassword1(employeeChangePassword, employeeChangeOldPasswordWarning)
);

employeeChangePasswordRepeat.addEventListener("input", () =>
  checkPasswordRepeat1(
    employeeChangePassword,
    employeeChangePasswordRepeat,
    employeeChangePasswordRepeatWarning
  )
);

btnChangeEmployeePassword.addEventListener("click", (e) => {
  checkOldPasswordEmployee(
    employeeId,
    employeeChangeCurrentUsername,
    employeeChangeOldPassword,
    employeeChangeOldPasswordWarning
  );

  checkPassword1(employeeChangePassword, employeeChangeOldPasswordWarning);
  checkPasswordRepeat1(
    employeeChangePassword,
    employeeChangePasswordRepeat,
    employeeChangePasswordRepeatWarning
  );

  if (!employeeChangeOldPassword.classList.contains("is-valid")) return;
  if (!employeeChangePassword.classList.contains("is-valid")) return;
  if (!employeeChangePasswordRepeat.classList.contains("is-valid")) return;

  axios
    .patch(`http://localhost:3001/accounts/employee`, {
      employeeId: employeeId,
      password: employeeChangePassword.value.trim(),
    })
    .then((result) => {
      if (!result.error) {
        passwordModal.hide();
        employeeChangeOldPassword.value = "";
        employeeChangePassword.value = "";
        employeeChangePasswordRepeat.value = "";
      }
    });
});

btnCancelChangeEmployeePassword.addEventListener("click", (e) => {
  employeeChangeOldPassword.value = "";
  employeeChangePassword.value = "";
  employeeChangePasswordRepeat.value = "";
});

window.addEventListener("load", () => {
  const btnDriverProfiles = document.querySelectorAll("#btn-driver-profile");
  console.log(btnDriverProfiles);
  btnDriverProfiles.forEach((btnDriverProfile) => {
    btnDriverProfile.addEventListener("click", () => {});
  });

  let driversOnline = [];

  socket.emit("GET_DRIVER_ONLINE");
  socket.on("GET_DRIVER_ONLINE", (data) => {
    document.getElementById("table").innerHTML = "";
    driversOnline = data;
  });

  const grid = new gridjs.Grid({
    search: {
      enabled: true,
      ignoreHiddenColumns: true,
    },

    columns: [
      "STT",
      "Họ và tên",
      "Ngày sinh",
      {
        name: "Email",
      },
      "Số điện thoại",
      "Ngày tham gia",
      {
        name: "Hoạt động",
        formatter: (cell, row) => {
          if (driversOnline.includes(cell))
            return gridjs.html(
              `<i class="bi bi-check-circle-fill text-success"></i>`
            );
          else
            return gridjs.html(
              `<i class="bi bi-x-circle-fill text-secondary"></i>`
            );
        },
        sort: {
          compare: (a, b) => {
            if (driversOnline.includes(a)) return -1;
            else if (driversOnline.includes(b)) return -1;
            else return 1;
          },
        },
      },
      {
        name: "Chi tiết",
        formatter: (cell, row) => {
          return gridjs.h(
            "button",
            {
              className: "btn btn-primary",
              onClick: () => btnDriverProfileClicked(row.cells[6].data),
            },
            gridjs.html(`<i class="bi bi-eye-fill"></i>`)
          );
        },
        // gridjs.html(
        //   `<button class="" id="btn-driver-profile" data-driver-id="${row.cells[6].data}" onclick="btnDriverProfileClicked()"></button>`
        //   // <button class="btn btn-warning btn-profile-driver" data-driver-id="${row.cells[6].data}"><i class="bi bi-pencil-square"></i></button>
        // ),
      },
    ],

    sort: {
      enabled: true,
    },

    pagination: {
      limit: 6,
    },

    server: {
      url: "http://localhost:3001/admin/drivers",
      method: "POST",
      then: (data) => {
        renderTotalDriver(data.length, driversOnline.length);
        return data.map((driver, index) => [
          ++index,
          driver.HOTX + " " + driver.TENTX,
          moment(driver.NGAYSINH).format("DD/MM/YYYY"),
          driver.EMAIL,
          driver.SDT,
          moment(driver.NGAYTHAMGIA).format("DD/MM/YYYY"),
          driver.MATX,
        ]);
      },
      total: (data) => data.length,
    },

    className: {
      th: "text-center",
      td: "text-center px-2 py-2",
    },

    language: {
      search: {
        placeholder: "🔍 Tìm kiếm",
      },
      pagination: {
        previous: () => gridjs.html(`<i class="bi bi-chevron-left"></i>`),
        next: () => gridjs.html(`<i class="bi bi-chevron-right"></i>`),
        showing: "Hiển thị",
        to: "đến",
        of: "trong",
        results: "kết quả",
      },
    },
  });
  grid.render(document.getElementById("table"));

  socket.on("GET_DRIVER_ONLINE", (data) => {
    driversOnline = data;
    grid.forceRender();
  });

  // setInterval(() => {
  // lets update the config
  //socket.emit("GET_DRIVER_ONLINE");

  // }, 1000 * 60);
});
