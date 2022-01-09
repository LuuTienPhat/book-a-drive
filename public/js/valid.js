const lastname = document.getElementById("lastname");
const firstname = document.getElementById("firstname");
const birthday = document.getElementById("birthday");
const gender = document.getElementById("gender");
const address = document.getElementById("address");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const identityNumber = document.getElementById("identity-number");
const username = document.getElementById("username");
const password = document.getElementById("password");
const passwordRepeat = document.getElementById("password-repeat");
const vehicleBrand = document.getElementById("vehicle-brand");
const vehicleName = document.getElementById("vehicle-name");
const licensePlate = document.getElementById("license-plate");
const vehicleColor = document.getElementById("vehicle-color");

const lastnameWarning = document.getElementById("lastname-warning");
const firstnameWarning = document.getElementById("firstname-warning");
const birthdayWarning = document.getElementById("birthday-warning");
const genderWarning = document.getElementById("gender-warning");
const identityNumberWarning = document.getElementById(
  "identity-number-warning"
);
const addressWarning = document.getElementById("address-warning");
const phoneWarning = document.getElementById("phone-warning");
const emailWarning = document.getElementById("email-warning");
const countryWarning = document.getElementById("country-warning");
const usernameWarning = document.getElementById("username-warning");
const passwordWarning = document.getElementById("password-warning");
const passwordRepeatWarning = document.getElementById(
  "password-repeat-warning"
);
const vehicleBrandWarning = document.getElementById("vehicle-brand-warning");
const vehicleNameWarning = document.getElementById("vehicle-name-warning");
const licensePlateWarning = document.getElementById("license-plate-warning");
const vehicleColorWarning = document.getElementById("vehicle-color-warning");

const checkLastname = () => {
  if (lastname.value == "") {
    lastname.classList.add("is-invalid");
    lastnameWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    lastname.classList.remove("is-invalid");
    lastname.classList.add("is-valid");
  }
};

const checkFirstName = () => {
  if (firstname.value == "") {
    firstname.classList.add("is-invalid");
    firstnameWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    firstname.classList.remove("is-invalid");
    firstname.classList.add("is-valid");
  }
};

const checkBirthday = () => {
  const regex =
    /(((0[1-9]|[12][0-9]|3[01])([/])(0[13578]|10|12)([/])(\d{4}))|(([0][1-9]|[12][0-9]|30)([/])(0[469]|11)([/])(\d{4}))|((0[1-9]|1[0-9]|2[0-8])([/])(02)([/])(\d{4}))|((29)(\/)(02)([/])([02468][048]00))|((29)([/])(02)([/])([13579][26]00))|((29)([/])(02)([/])([0-9][0-9][0][48]))|((29)([/])(02)([/])([0-9][0-9][2468][048]))|((29)([/])(02)([/])([0-9][0-9][13579][26])))$/;
  const value = birthday.value;

  if (value == "") {
    birthday.classList.add("is-invalid");
    birthday.classList.remove("is-valid");
    birthdayWarning.innerHTML = "Hãy nhập ngày sinh";
    return;
  }
  if (value.length != 10) {
    birthday.classList.remove("is-valid");
    birthday.classList.add("is-invalid");
    birthdayWarning.innerHTML = "DD/MM/YYYY";
    return;
  } else {
    const date = moment(birthday.value, "DD/MM/YYYY");
    if (date.isValid()) {
      birthday.classList.add("is-valid");
      birthday.classList.remove("is-invalid");
    } else {
      birthday.classList.remove("is-valid");
      birthday.classList.add("is-invalid");
      birthdayWarning.innerHTML = "Ngày tháng năm không đúng";
    }
  }
};

const checkEmail = () => {
  const email_regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.value == "") {
    email.classList.add("is-invalid");
    emailWarning.innerHTML = "Hãy nhập email";
    return;
  }

  if (email_regex.test(email.value)) {
    email.classList.add("is-valid");
    email.classList.remove("is-invalid");
  } else {
    email.classList.add("is-invalid");
    emailWarning.innerHTML = "Email không đúng";
  }
};

const checkPhone = () => {
  const phone_regex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
  if (phone.value == "") {
    phone.classList.add("is-invalid");
    phoneWarning.innerHTML = "Hãy nhập số điện thoại";
    return;
  }

  if (phone_regex.test(phone.value)) {
    phone.classList.add("is-valid");
    phone.classList.remove("is-invalid");
  } else {
    phone.classList.add("is-invalid");
    phoneWarning.innerHTML = "Số điện thoại không đúng";
  }
};

const checkGender = () => {
  if (gender.value == "") {
    gender.classList.add("is-invalid");
    genderWarning.innerHTML = "Hãy chọn giới tính";
    return;
  } else {
    gender.classList.remove("is-invalid");
    gender.classList.add("is-valid");
  }
};

const checkIdentityNumber = () => {
  const identityNumberRegex = /^(\d{9}|\d{12})$/;
  if (identityNumber.value == "") {
    identityNumber.classList.add("is-invalid");
    identityNumberWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  }
  if (!identityNumberRegex.test(identityNumber.value)) {
    identityNumber.classList.add("is-invalid");
    identityNumber.classList.remove("is-valid");
    identityNumberWarning.innerHTML = "CMND/CCCD không hợp lệ";
  } else {
    identityNumber.classList.remove("is-invalid");
    identityNumber.classList.add("is-valid");
  }
};

const checkAddress = () => {
  if (address.value == "") {
    address.classList.add("is-invalid");
    addressWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    address.classList.remove("is-invalid");
    address.classList.add("is-valid");
  }
};

const checkCountry = () => {
  if (country.value == "") {
    country.classList.add("is-invalid");
    countryWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    country.classList.remove("is-invalid");
    country.classList.add("is-valid");
  }
};

const checkUsernameDriver = () => {
  const value = username.value;
  if (username.value == "") {
    username.classList.add("is-invalid");
    usernameWarning.innerHTML = "Hãy nhập tên đăng nhập";
    return;
  }

  axios
    .post(`http://localhost:3001/accounts/drivers/check`, {
      username: value,
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

const checkUsernameCustomer = () => {
  const value = username.value;
  if (username.value == "") {
    username.classList.add("is-invalid");
    usernameWarning.innerHTML = "Hãy nhập tên đăng nhập";
    return;
  }

  axios
    .post(`http://localhost:3001/accounts/customers/check`, {
      username: value,
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

const checkUsername = () => {
  if (username.value == "") {
    username.classList.add("is-invalid");
    username.classList.remove("is-valid");
    usernameWarning.innerHTML = "Hãy nhập tên đăng nhập";
    return;
  } else {
    username.classList.remove("is-invalid");
    username.classList.add("is-valid");
  }
};

const checkPassword = () => {
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{5,})");
  if (password.value == "") {
    password.classList.add("is-invalid");
    passwordWarning.innerHTML = "Hãy nhập mật khẩu";
    return;
  }

  if (!strongRegex.test(password.value)) {
    passwordWarning.innerHTML = "Mật khẩu không đúng, Hãy kiểm tra lại!";
    password.classList.add("is-invalid");
  } else {
    password.classList.add("is-valid");
    password.classList.remove("is-invalid");
  }
};

const checkCurrentUsernameDriver = () => {
  if (username.value == "") {
    username.classList.add("is-invalid");
    usernameWarning.innerHTML = "Hãy nhập tên đăng nhập";
    return;
  }

  axios
    .post(`http://localhost:3001/accounts/drivers/check`, {
      username: value,
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

const checkCurrentUsernameCustomer = () => {
  const value = username.value;
  if (username.value == "") {
    username.classList.add("is-invalid");
    usernameWarning.innerHTML = "Hãy nhập tên đăng nhập";
    return;
  }

  axios
    .post(`http://localhost:3001/accounts/customers/check`, {
      username: value,
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

const checkPasswordRepeat = () => {
  if (passwordRepeat.value == "") {
    passwordRepeat.classList.add("is-invalid");
    passwordRepeatWarning.innerHTML = "Hãy nhập lại mật khẩu";
    return;
  }

  if (password.value == passwordRepeat.value) {
    passwordRepeat.classList.add("is-valid");
    passwordRepeat.classList.remove("is-invalid");
  } else {
    passwordRepeatWarning.innerHTML = "Mật khẩu không trùng";
    passwordRepeat.classList.add("is-invalid");
  }
};

const checkVehicleBrand = () => {
  if (vehicleBrand.value == "") {
    vehicleBrand.classList.add("is-invalid");
    vehicleBrandWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    vehicleBrand.classList.remove("is-invalid");
    vehicleBrand.classList.add("is-valid");
  }
};

const checkVehicleName = () => {
  if (vehicleName.value == "") {
    vehicleName.classList.add("is-invalid");
    vehicleNameWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    vehicleName.classList.remove("is-invalid");
    vehicleName.classList.add("is-valid");
  }
};

const checkLicensePlate = () => {
  if (licensePlate.value == "") {
    licensePlate.classList.add("is-invalid");
    licensePlateWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    licensePlate.classList.remove("is-invalid");
    licensePlate.classList.add("is-valid");
  }
};

const checkVehicleColor = () => {
  if (vehicleColor.value == "") {
    vehicleColor.classList.add("is-invalid");
    vehicleColorWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    vehicleColor.classList.remove("is-invalid");
    vehicleColor.classList.add("is-valid");
  }
};

const checkCode = () => {
  if (code.value == "") {
    code.classList.add("is-invalid");
    code.classList.remove("is-valid");
    codeWarning.innerHTML = "Hãy nhập mã khôi phục";
    return;
  } else {
    code.classList.remove("is-invalid");
    code.classList.add("is-valid");
  }
};

const form = document.getElementById("form");
if (form) {
  form.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
    },
    true
  );
}
(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();
