const currentUsername = document.getElementById("current-username");
const oldPassword = document.getElementById("old-password");

const oldPasswordWarning = document.getElementById("old-password-warning");

const a = [lastname, firstname, birthday, email, gender, address, phone];

const checkOldPasswordCustomer = (customerId) => {
  if (oldPassword.value == "") {
    oldPassword.classList.remove("is-valid");
    oldPassword.classList.add("is-invalid");
    oldPasswordWarning.innerHTML = "Không được để trống";
    return;
  }

  axios
    .post("http://localhost:3001/accounts/customers/check", {
      customerId: customerId,
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

const checkOldPasswordDriver = (driverId) => {
  if (oldPassword.value == "") {
    oldPassword.classList.remove("is-valid");
    oldPassword.classList.add("is-invalid");
    oldPasswordWarning.innerHTML = "Không được để trống";
    return;
  }

  axios
    .post("http://localhost:3001/accounts/drivers/check", {
      driverId: driverId,
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

const checkAll = () => {
  checkFirstName();
  checkLastname();
  checkPhone();
  checkEmail();
  checkUsername();
  checkPassword();
  checkPasswordRepeat();
};

const getId = () => {
  return new Promise((resolve) => {
    socket.on("SET_ID", (data) => {
      resolve(data);
    });
  });
};

async function run() {
  let driverId, customerId;
  if (path == "driver") {
    driverId = await getId();
  } else customerId = await getId();

  birthday.addEventListener("input", checkBirthday);
  lastname.addEventListener("input", checkLastname);
  firstname.addEventListener("input", checkFirstName);
  email.addEventListener("input", checkEmail);
  phone.addEventListener("input", checkPhone);
  username.addEventListener("input", () => {
    if (path == "driver") checkUsernameDriver();
    else checkUsernameCustomer();
  });

  oldPassword.addEventListener("input", () => {
    if (path == "driver") checkOldPasswordDriver(driverId);
    else checkOldPasswordCustomer(customerId);
  });
  password.addEventListener("input", checkPassword);
  passwordRepeat.addEventListener("input", checkPasswordRepeat);

  const checkValid = () => {
    if (!firstname.classList.contains("is-valid")) return false;
    if (!lastname.classList.contains("is-valid")) return false;
    if (!email.classList.contains("is-valid")) return false;
    if (!phone.classList.contains("is-valid")) return false;
    return true;
  };

  const btnCancelUser = document.getElementById("btn-cancel-user");
  const btnSaveUser = document.getElementById("btn-save-user");
  const btnChangeUser = document.getElementById("btn-change-user");
  const btnChangeUsername = document.getElementById("btn-change-username");
  const btnChangePassword = document.getElementById("btn-change-password");

  if (btnChangeUser) {
    btnChangeUser.addEventListener("click", () => {
      for (let i = 0; i < a.length; i++) {
        a[i].disabled = false;
      }
      btnChangeUser.classList.add("d-none");
      btnSaveUser.classList.remove("d-none");
      btnCancelUser.classList.remove("d-none");
      checkLastname();
      checkFirstName();
      checkEmail();
      checkPhone();
    });

    btnSaveUser.addEventListener("click", () => {
      if (!checkValid()) {
        checkLastname();
        checkFirstName();
        checkEmail();
        checkPhone();
        return;
      } else {
        axios
          .put("/customer/profile", {
            firstname: firstname.value,
            lastname: lastname.value,
            birthday: birthday.value == "..." ? "" : birthday.value,
            gender: gender.value == "..." ? "" : gender.value,
            phone: phone.value,
            email: email.value,
            address: address.value,
          })
          .then((result) => result.data)
          .then((data) => {
            if (data) window.location.reload();
          });
      }
    });

    btnCancelUser.addEventListener("click", () => {
      window.location.reload();
    });
  }

  btnChangeUsername.addEventListener("click", () => {
    const value = currentUsername.value;
    if (username.value == value) return;
    if (username.classList.contains("is-invalid")) return;
    if (path == "driver") {
      axios
        .patch(`http://localhost:3001/accounts/drivers`, {
          driverId: driverId,
          username: username.value.trim(),
        })
        .then((result) => {
          if (result.status == 200) window.location.reload();
        });
    } else {
      axios
        .patch(`http://localhost:3001/accounts/customers`, {
          customerId: customerId,
          username: username.value.trim(),
        })
        .then((result) => {
          if (result.status == 200) window.location.reload();
        });
    }
  });

  btnChangePassword.addEventListener("click", () => {
    if (path == "driver") checkOldPasswordDriver();
    else checkOldPasswordDriver();
    checkPassword();
    checkPasswordRepeat();

    if (!oldPassword.classList.contains("is-valid")) return;
    if (!password.classList.contains("is-valid")) return;
    if (!passwordRepeat.classList.contains("is-valid")) return;

    if (path == "driver") {
      axios
        .patch(`http://localhost:3001/accounts/drivers`, {
          driverId: driverId,
          password: password.value,
        })
        .then((res) => {
          if (res.status == 200) passwordModal.hide();
        });
    } else {
      axios
        .patch(`http://localhost:3001/accounts/customers`, {
          customerId: customerId,
          password: password.value,
        })
        .then((res) => {
          if (res.status == 200) passwordModal.hide();
        });
    }
  });
}
run();
