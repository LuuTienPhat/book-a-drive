const lastname = document.getElementById("lastname");
const firstname = document.getElementById("firstname");
const birthday = document.getElementById("birthday");
const gender = document.getElementById("gender");
const address = document.getElementById("address");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const username = document.getElementById("username");
const currentUsername = document.getElementById("current-username");
const oldPassword = document.getElementById("old-password");
const password = document.getElementById("password");
const passwordRepeat = document.getElementById("password-repeat");

const lastnameWarning = document.getElementById("lastname-warning");
const firstnameWarning = document.getElementById("firstname-warning");
const birthdayWarning = document.getElementById("birthday-warning");
const phoneWarning = document.getElementById("phone-warning");
const emailWarning = document.getElementById("email-warning");
const usernameWarning = document.getElementById("username-warning");
const passwordWarning = document.getElementById("password-warning");
const passwordRepeatWarning = document.getElementById(
  "password-repeat-warning"
);
const oldPasswordWarning = document.getElementById("old-password-warning");
const form = document.getElementById("form");
form.addEventListener(
  "submit",
  (e) => {
    e.preventDefault();
  },
  true
);

const checkLastname = () => {
  if (lastname.value == "") {
    lastname.classList.add("is-invalid");
    return;
  } else {
    lastname.classList.remove("is-invalid");
    lastname.classList.add("is-valid");
  }
};

const checkFirstName = () => {
  if (firstname.value == "") {
    firstname.classList.add("is-invalid");
    return;
  } else {
    firstname.classList.remove("is-invalid");
    firstname.classList.add("is-valid");
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

const checkEmail = () => {
  const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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

const checkBirthday = () => {
  const leapYear = (year) => {
    return (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
  };
  const regex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
  const value = birthday.value;

  if (value == "") {
    birthday.classList.remove("is-invalid");
    return;
  }

  if (regex.test(value)) {
    const year = value.substr(6, 4);
    if (leapYear(year)) {
      birthday.classList.add("is-valid");
      birthday.classList.remove("is-invalid");
    } else {
      birthday.classList.remove("is-valid");
      birthday.classList.add("is-invalid");
      birthdayWarning.innerHTML = "Năm này không nhuận nhé";
    }
  } else {
    birthday.classList.remove("is-valid");
    birthday.classList.add("is-invalid");
    birthdayWarning.innerHTML = "dd/mm/yyyy";
  }
};

const checkUsername = () => {
  const value = username.value;
  if (username.value == "") {
    username.classList.add("is-invalid");
    usernameWarning.innerHTML = "Hãy nhập tên đăng nhập";
    return;
  }
  postData(`http://localhost:3001/customers/accounts/check`, {
    username: value,
  })
    .then((res) => res.json())
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

const checkOldPassword = () => {
  if (oldPassword.value == "") {
    oldPassword.classList.remove("is-valid");
    oldPassword.classList.add("is-invalid");
    oldPasswordWarning.innerHTML = "Không được để trống";
    return;
  }

  postData("http://localhost:3001/customers/accounts/check", {
    username: currentUsername.value.trim(),
    password: oldPassword.value,
  })
    .then((res) => res.json())
    .then((data) => {
      // console.log(data);
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

export { checkEmail, checkPassword, checkPasswordRepeat };

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
