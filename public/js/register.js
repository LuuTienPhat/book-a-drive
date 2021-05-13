const lastname = document.getElementById("lastname");
const firstname = document.getElementById("firstname");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const username = document.getElementById("username");
const password = document.getElementById("password");
const passwordRepeat = document.getElementById("password-repeat");

const lastnameWarning = document.getElementById("lastname-warning");
const firstnameWarning = document.getElementById("firstname-warning");
const phoneWarning = document.getElementById("phone-warning");
const emailWarning = document.getElementById("email-warning");
const usernameWarning = document.getElementById("username-warning");
const passwordWarning = document.getElementById("password-warning");
const passwordRepeatWarning = document.getElementById(
  "password-repeat-warning"
);

async function postData(url = "", data = {}, method = "POST") {
  // Default options are marked with *
  const response = await fetch(url, {
    method: method, // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

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

const checkUsername = () => {
  const value = username.value;
  if (username.value == "") {
    username.classList.add("is-invalid");
    usernameWarning.innerHTML = "Hãy nhập tên đăng nhập";
    return;
  }

  fetch(`http://localhost:3001/customer/${value}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.found) {
        console.log("run");
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

const checkAll = () => {
  checkFirstName();
  checkLastname();
  checkPhone();
  checkEmail();
  checkUsername();
  checkPassword();
  checkPasswordRepeat();
};

lastname.addEventListener("input", checkLastname);
firstname.addEventListener("input", checkFirstName);
email.addEventListener("input", checkEmail);
phone.addEventListener("input", checkPhone);
username.addEventListener("focusout", checkUsername);
password.addEventListener("input", checkPassword);
passwordRepeat.addEventListener("input", checkPasswordRepeat);

const checkValid = () => {
  if (!firstname.classList.contains("is-valid")) return false;
  if (!lastname.classList.contains("is-valid")) return false;
  if (!email.classList.contains("is-valid")) return false;
  if (!phone.classList.contains("is-valid")) return false;
  if (!username.classList.contains("is-valid")) return false;
  if (!password.classList.contains("is-valid")) return false;
  if (!passwordRepeat.classList.contains("is-valid")) return false;
  return true;
};

const form = document.getElementById("form");
form.addEventListener(
  "submit",
  (e) => {
    e.preventDefault();
  },
  true
);

const button = document.getElementById("button");
button.addEventListener("click", () => {
  if (!checkValid()) {
    checkAll();
    modal.show();
    return;
  } else {
    postData("/customer/register", {
      firstname: firstname.value,
      lastname: lastname.value,
      phone: phone.value,
      email: email.value,
      username: username.value,
      password: password.value,
    }).then((data) => (window.location.href = data.url));
  }
});

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
