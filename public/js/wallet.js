const accountNumber = document.getElementById("account-number");
const rechargeAccountNumber = document.getElementById("r-account-number");
const bankName = document.getElementById("bank-name");
const accountName = document.getElementById("account-name");
const money = document.getElementById("money");
const rehchargeMoney = document.getElementById("r-money");
const pin = document.getElementById("pin-number");
const moneyInWallet = document.getElementById("moneyInWallet");

const accountNumberWarning = document.getElementById("account-number-warning");
const rechargeAccountNumberWarning = document.getElementById(
  "r-account-number-warning"
);
const bankNameWarning = document.getElementById("bank-name-warning");
const accountNameWarning = document.getElementById("account-name-warning");
const moneyWarning = document.getElementById("money-warning");
const rechargeMoneyWarning = document.getElementById("r-money-warning");
const pinWarning = document.getElementById("pin-number-warning");

const withdraw = document.getElementById("withdraw");
const recharge = document.getElementById("recharge");
const cancelRecharge = document.getElementById("btn-cancel-recharge");
const cancelWithdraw = document.getElementById("btn-cancel-withdraw");

function isNumber(n) {
  return /^-?[\d.]+(?:e-?\d+)?$/.test(n);
}

const checkAccountNumber = (accountNumber, accountNumberWarning) => {
  if (accountNumber.value == "") {
    accountNumber.classList.add("is-invalid");
    accountNumberWarning.innerText = "Ô này không được để trống";
    return;
  } else if (!isNumber(accountNumber.value)) {
    accountNumber.classList.add("is-invalid");
    accountNumberWarning.innerText = "Số tài khoản không được chứa chuỗi";
    return;
  } else {
    accountNumber.classList.remove("is-invalid");
    accountNumber.classList.add("is-valid");
  }
};

const checkBankName = () => {
  if (bankName.value == "") {
    bankName.classList.add("is-invalid");
    bankNameWarning.innerText = "Ô này không được để trống";
    return;
  } else {
    bankName.classList.remove("is-invalid");
    bankName.classList.add("is-valid");
  }
};

const checkAccountName = () => {
  if (accountName.value == "") {
    accountName.classList.add("is-invalid");
    accountNameWarning.innerText = "Ô này không được để trống";
    return;
  } else {
    accountName.classList.remove("is-invalid");
    accountName.classList.add("is-valid");
  }
};

const checkMoney = (money, moneyWarning) => {
  if (money.value == "") {
    money.classList.add("is-invalid");
    moneyWarning.innerText = "Ô này không được để trống";
    return;
  } else if (money.value <= 0) {
    money.classList.add("is-invalid");
    moneyWarning.innerText = "Số tiền phải lớn hơn 0";
    return;
  } else if (!isNumber(money.value)) {
    money.classList.add("is-invalid");
    moneyWarning.innerText = "Tiền không được chứa ký tự";
    return;
  } else {
    money.classList.remove("is-invalid");
    money.classList.add("is-valid");
  }
};

const checkPIN = () => {
  if (pin.value == "") {
    pin.classList.add("is-invalid");
    pinWarning.innerText = "Ô này không được để trống";
    return;
  } else if (!isNumber(pin.value)) {
    pin.classList.add("is-invalid");
    pinWarning.innerText = "Mã pin không được chứa ký tự";
    return;
  } else {
    pin.classList.remove("is-invalid");
    pin.classList.add("is-valid");
  }
};

accountName.addEventListener("input", checkAccountName);
accountNumber.addEventListener("input", () =>
  checkAccountNumber(accountNumber, accountNumberWarning)
);
bankName.addEventListener("input", checkBankName);
money.addEventListener("input", () => checkMoney(money, moneyWarning));
rehchargeMoney.addEventListener("input", () =>
  checkMoney(rehchargeMoney, rechargeMoneyWarning)
);
pin.addEventListener("input", checkPIN);
rechargeAccountNumber.addEventListener("input", () =>
  checkAccountNumber(rechargeAccountNumber, rechargeAccountNumberWarning)
);

moment.locale("vi");

async function init() {
  const getDriverId = () => {
    return new Promise((resolve) => {
      socket.on("SET_ID", (data) => {
        resolve(data);
      });
    });
  };

  socket.driverId = await getDriverId();

  //NAP TIEN VAO VI
  recharge.addEventListener("click", () => {
    checkAccountNumber(rechargeAccountNumber, rechargeAccountNumberWarning);
    checkMoney(rehchargeMoney, rechargeMoneyWarning);
    checkPIN();

    if (!rechargeAccountNumber.classList.contains("is-valid")) return;
    if (!rehchargeMoney.classList.contains("is-valid")) return;
    if (!pin.classList.contains("is-valid")) return;

    axios
      .patch(`http://localhost:3001/wallets`, {
        driverId: socket.driverId,
        amount: rehchargeMoney.value,
        detail: "NAP TIEN",
      })
      .then((result) => {
        if (!result.error) {
          axios
            .post(`http://localhost:3001/wallets`, {
              driverId: socket.driverId,
            })
            .then((result) => {
              moneyInWallet.innerHTML = vietnamMoneyFormat(result.data.TIEN);
              rechargeModal.hide();
            });
        }
      });
  });

  cancelRecharge.addEventListener("click", () => {
    rechargeAccountNumber.value = "";
    rehchargeMoney.value = "";
    pin.value = "";
  });

  //CHUYEN TIEN RA NGOAI
  withdraw.addEventListener("click", () => {
    checkAccountName();
    checkAccountNumber(accountNumber, accountNumberWarning);
    checkMoney(money, moneyWarning);
    checkBankName();

    if (!accountNumber.classList.contains("is-valid")) return;
    if (!bankName.classList.contains("is-valid")) return;
    if (!accountName.classList.contains("is-valid")) return;
    if (!money.classList.contains("is-valid")) return;

    axios
      .patch(`http://localhost:3001/wallets`, {
        driverId: socket.driverId,
        amount: money.value,
        detail: "CHUYEN TIEN",
      })
      .then((result) => {
        if (!result.error) {
          if (!result.error) {
            axios
              .post(`http://localhost:3001/wallets`, {
                driverId: socket.driverId,
              })
              .then((result) => {
                moneyInWallet.innerHTML = vietnamMoneyFormat(result.data.TIEN);
                moneyModal.hide();
              });
          }
        }
      });
  });

  cancelWithdraw.addEventListener("click", () => {
    accountNumber.value = "";
    bankName.value = "";
    accountName.value = "";
    money.value = "";
  });

  //HIỂN THỊ CÁC THÔNG TIN NHƯ NGÀY THÁNG NĂM, TIỀN CHIẾT KHẤU, TIỀN THU ĐƯỢC, TIỀN CHUYỂN, TIỀN NẠP
  const renderSwiper = (() => {
    let map = [];

    for (let i = 60; i >= 0; i--) {
      map.push(
        `<div class="swiper-slide text-dark border border-secondary border-2 rounded d-flex flex-column align-items-center justify-content-center"
          data-date="${moment()
            .subtract(i, "days")
            .utc(7)
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            .toISOString()}"
          data-key="${i}"
          id="button"
      >
          <h6 class="my-0 mb-1"> <b>${moment()
            .subtract(i, "days")
            .format("dd")}</b></h6>
          <h6 class="my-0"> <b>${moment()
            .subtract(i, "days")
            .format("DD/MM")}</b></h6>
      </div>`
      );
    }
    let result = map.join("");
    document.getElementById("swiper-wrapper").innerHTML = result;
    swiper.update();
  })(); // run when load

  const buttons = document.querySelectorAll("#button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const date = button.dataset.date;
      const driverId = socket.driverId;
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
        .get(
          `http://localhost:3001/wallets/histories?driverId=${driverId}&&date=${date}`
        )
        .then((res) => {
          return res.data;
        })
        .then((data) => {
          console.log(data);
          renderDiscount(data);
          renderWithdrawal(data);
          renderRecharge(data);
        })
        .catch((err) => console.log(err));
    });
  });

  buttons[buttons.length - 1].click();

  const renderDiscount = (data) => {
    const result = data.map((each) => {
      // console.log(moment.utc(each.GIODATXE).format("HH:mm"));
      if (each.NOIDUNG == "CHIET KHAU") {
        return `<div
                  class="d-flex justify-content-center align-items-center py-2 px-2 border border-2 border-primary rounded mb-1"
                  id="place-item"
                  data-drive="${each.NOIDUNG}"
                  >
                  <div class="pe-2 overflow-hidden w-75">
                      <h5 class="text-truncate">
                          ${moment.utc(each.GIOGIAODICH).format("HH:mm")}
                      </h5>
                      <div class="d-flex justify-content-start align-items-center">
                      <p
                          class="text-truncate text-secondary my-0"
                          style="font-size: 14px"
                      >
                          <i class="bi bi-align-center"></i>
                          Trừ chiết khấu
                      </p>
                      </div>
                  </div>
                  <div class="d-flex flex-column w-75 align-items-end">
                      <h6 class="text-secondary my-0 mb-1">Số tiền: 
                        <span class="my-0 text-danger text-end">
                        - ${vietnamMoneyFormat(each.SOTIEN)}
                        </span>
                      </h6>
                      <h6 class="text-secondary my-0">Số dư:  
                        <span class="my-0 text-success text-end">
                        ${vietnamMoneyFormat(each.SODU)}
                        </span>
                      </h6>
                      
                  </div>
                  </div>`;
      }
    });
    document.getElementById("discount-pane").innerHTML = result.join("");
  };

  const renderWithdrawal = (data) => {
    const result = data.map((each) => {
      // console.log(moment.utc(each.GIODATXE).format("HH:mm"));
      if (each.NOIDUNG == "CHUYEN TIEN") {
        return `<div
                  class="d-flex justify-content-center align-items-center py-2 px-2 border border-2 border-primary rounded mb-1"
                  id="place-item"
                  data-drive="${each.NOIDUNG}"
                  >
                  <div class="pe-2 overflow-hidden w-75">
                      <h5 class="text-truncate">
                          ${moment.utc(each.GIOGIAODICH).format("HH:mm")}
                      </h5>
                      <div class="d-flex justify-content-start align-items-center">
                      <p
                          class="text-truncate text-secondary my-0"
                          style="font-size: 14px"
                      >
                          <i class="bi bi-align-center"></i>
                          Trừ chiết khấu
                      </p>
                      </div>
                  </div>
                  <div class="d-flex flex-column w-75 align-items-end">
                      <h6 class="text-secondary my-0 mb-1">Số tiền: 
                        <span class="my-0 text-danger text-end">
                        ${vietnamMoneyFormat(each.SOTIEN)}
                        </span>
                      </h6>
                      <h6 class="text-secondary my-0">Số dư:  
                        <span class="my-0 text-success text-end">
                        ${vietnamMoneyFormat(each.SODU)}
                        </span>
                      </h6>
                      
                  </div>
                  </div>`;
      }
    });
    document.getElementById("withdrawal-pane").innerHTML = result.join("");
  };

  const renderRecharge = (data) => {
    const result = data.map((each) => {
      if (each.NOIDUNG == "NAP TIEN") {
        return `<div
                  class="d-flex justify-content-center align-items-center py-2 px-2 border border-2 border-primary rounded mb-1"
                  id="place-item"
                  data-drive="${each.NOIDUNG}"
                  >
                  <div class="pe-2 overflow-hidden w-75">
                      <h5 class="text-truncate">
                          ${moment.utc(each.GIOGIAODICH).format("HH:mm")}
                      </h5>
                      <div class="d-flex justify-content-start align-items-center">
                      <p
                          class="text-truncate text-secondary my-0"
                          style="font-size: 14px"
                      >
                          <i class="bi bi-align-center"></i>
                          Trừ chiết khấu
                      </p>
                      </div>
                  </div>
                  <div class="d-flex flex-column w-75 align-items-end">
                      <h6 class="text-secondary my-0 mb-1">Số tiền: 
                        <span class="my-0 text-danger text-end">
                        ${vietnamMoneyFormat(each.SOTIEN)}
                        </span>
                      </h6>
                      <h6 class="text-secondary my-0">Số dư:  
                        <span class="my-0 text-success text-end">
                        ${vietnamMoneyFormat(each.SODU)}
                        </span>
                      </h6>
                      
                  </div>
                  </div>`;
      }
    });
    document.getElementById("recharge-pane").innerHTML = result.join("");
  };
}
init();
