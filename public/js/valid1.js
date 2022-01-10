// const lastname1 = document.getElementById("lastname1");
// const firstname1 = document.getElementById("firstname1");
// const birthday1 = document.getElementById("birthday1");
// const gender1 = document.getElementById("gender1");
// const address1 = document.getElementById("address1");
// const phone1 = document.getElementById("phone1");
// const email1 = document.getElementById("email1");
// const identityNumber1 = document.getElementById("identity-number1");
// const username1 = document.getElementById("username1");
// const password1 = document.getElementById("password1");
// const passwordRepeat1 = document.getElementById("password-repeat1");
// const vehicleBrand1 = document.getElementById("vehicle-brand1");
// const vehicleName1 = document.getElementById("vehicle-name1");
// const licensePlate1 = document.getElementById("license-plate1");
// const vehicleColor1 = document.getElementById("vehicle-color1");

// const lastnameWarning1 = document.getElementById("lastname-warning1");
// const firstnameWarning1 = document.getElementById("firstname-warning1");
// const birthdayWarning1 = document.getElementById("birthday-warning1");
// const genderWarning1 = document.getElementById("gender-warning1");
// const identityNumberWarning1 = document.getElementById(
//   "identity-number-warning1"
// );
// const addressWarning1 = document.getElementById("address-warning1");
// const phoneWarning1 = document.getElementById("phone-warning1");
// const emailWarning1 = document.getElementById("email-warning1");
// const countryWarning1 = document.getElementById("country-warning1");
// const usernameWarning1 = document.getElementById("username-warning1");
// const passwordWarning1 = document.getElementById("password-warning1");
// const passwordRepeatWarning1 = document.getElementById(
//   "password-repeat-warning1"
// );
// const vehicleBrandWarning1 = document.getElementById("vehicle-brand-warning1");
// const vehicleNameWarning1 = document.getElementById("vehicle-name-warning1");
// const licensePlateWarning1 = document.getElementById("license-plate-warning1");
// const vehicleColorWarning1 = document.getElementById("vehicle-color-warning1");

const checkLastname1 = (lastname, lastnameWarning) => {
  if (lastname.value == "") {
    lastname.classList.add("is-invalid");
    lastnameWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    lastname.classList.remove("is-invalid");
    lastname.classList.add("is-valid");
  }
};

const checkFirstName1 = (firstname, firstnameWarning) => {
  if (firstname.value == "") {
    firstname.classList.add("is-invalid");
    firstnameWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    firstname.classList.remove("is-invalid");
    firstname.classList.add("is-valid");
  }
};

const checkPassword1 = (password, passwordWarning) => {
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

const checkPasswordRepeat1 = (
  password,
  passwordRepeat,
  passwordRepeatWarning
) => {
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

const checkBirthday1 = (birthday, birthdayWarning) => {
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

const checkEmail1 = (email, emailWarning) => {
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

const checkPhone1 = (phone, phoneWarning) => {
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

const checkGender1 = (gender, genderWarning) => {
  if (gender.value == "") {
    gender.classList.add("is-invalid");
    genderWarning.innerHTML = "Hãy chọn giới tính";
    return;
  } else {
    gender.classList.remove("is-invalid");
    gender.classList.add("is-valid");
  }
};

const checkIdentityNumber1 = (identityNumber, identityNumberWarning) => {
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

const checkAddress1 = (address, addressWarning) => {
  if (address.value == "") {
    address.classList.add("is-invalid");
    addressWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    address.classList.remove("is-invalid");
    address.classList.add("is-valid");
  }
};

const checkCountry1 = (country, countryWarning) => {
  if (country.value == "") {
    country.classList.add("is-invalid");
    countryWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    country.classList.remove("is-invalid");
    country.classList.add("is-valid");
  }
};

const checkVehicleBrand1 = (vehicleBrand, vehicleBrandWarning) => {
  if (vehicleBrand.value == "") {
    vehicleBrand.classList.add("is-invalid");
    vehicleBrandWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    vehicleBrand.classList.remove("is-invalid");
    vehicleBrand.classList.add("is-valid");
  }
};

const checkVehicleName1 = (vehicleName, vehicleNameWarning) => {
  if (vehicleName.value == "") {
    vehicleName.classList.add("is-invalid");
    vehicleNameWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    vehicleName.classList.remove("is-invalid");
    vehicleName.classList.add("is-valid");
  }
};

const checkLicensePlate1 = (licensePlate, licensePlateWarning) => {
  if (licensePlate.value == "") {
    licensePlate.classList.add("is-invalid");
    licensePlateWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    licensePlate.classList.remove("is-invalid");
    licensePlate.classList.add("is-valid");
  }
};

const checkVehicleColor1 = (vehicleColor, vehicleColorWarning) => {
  if (vehicleColor.value == "") {
    vehicleColor.classList.add("is-invalid");
    vehicleColorWarning.innerHTML = "Ô này không được bỏ trống";
    return;
  } else {
    vehicleColor.classList.remove("is-invalid");
    vehicleColor.classList.add("is-valid");
  }
};
