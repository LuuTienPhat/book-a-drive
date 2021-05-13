import {
  checkEmail,
  checkPassword,
  checkPasswordRepeat,
} from "./valid.module.js";
const username = document.getElementById("username");
const usernameWarning = document.getElementById("username-warning");
const codeSendAfter = document.getElementById("code-send-after");
const btnGetCode = document.getElementById("btn-get-code");
const code = document.getElementById("code");
const btnCheckCode = document.getElementById("btn-check-code");
const btnChangePassword = document.getElementById("btn-change-password");
const codeWarning = document.getElementById("code-warning");
const codePanel = document.getElementById("code-panel");
const passwordRepeat = document.getElementById("password-repeat");

// passwordModal.show();

const checkUsername = () => {
  const value = username.value;
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

const countdown = (second) => {
  codeSendAfter.innerHTML = "";
  codeSendAfter.classList.remove("d-none");
  const interval = setInterval(() => {
    codeSendAfter.innerHTML = `Mã sẽ được gửi sau... ${second}s`;
    if (second == 0) {
      codeSendAfter.innerHTML = "Hãy kiểm tra mail của bạn";
      codePanel.classList.remove("d-none");
      clearInterval(interval);
    }
    second--;
  }, 1000);
};

email.addEventListener("input", checkEmail);
username.addEventListener("input", checkUsername);
password.addEventListener("input", checkPassword);
passwordRepeat.addEventListener("input", checkPasswordRepeat);

btnGetCode.addEventListener("click", () => {
  checkEmail();
  checkUsername();
  if (!email.classList.contains("is-valid")) return;
  if (!username.classList.contains("is-valid")) return;
  axios
    .post(`http://localhost:3001/forgot-password/check`, {
      email: email.value,
      username: username.value,
    })
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      console.log(data);
      if (data.email && data.username) {
        axios.post(`http://localhost:3001/forgot-password/send`, {
          email: email.value,
          username: username.value,
        });

        countdown(5);
      } else {
        notificationModal.show();
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

btnCheckCode.addEventListener("click", () => {
  checkCode();
  if (!code.classList.contains("is-valid")) return;
  axios
    .post(`http://localhost:3001/forgot-password/check`, {
      email: email.value,
      username: username.value,
      recoveryCode: code.value,
    })
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      if (data.email && data.username && data.recoveryCode) {
        passwordModal.show();
      } else {
        code.classList.add("is-invalid");
        code.classList.remove("is-valid");
        codeWarning.innerHTML = "Mã khôi phục sai";
      }
    });
});

btnChangePassword.addEventListener("click", () => {
  console.log("run");
  checkPassword();
  checkPasswordRepeat();

  if (!password.classList.contains("is-valid")) return;
  if (!passwordRepeat.classList.contains("is-valid")) return;
  const value = username.value;
  axios
    .put(`http://localhost:3001/customers/accounts/${value}`, {
      username: username.value,
      password: password.value,
    })
    .then((res) => {
      if (res.status == 200) {
        passwordModal.hide();
        redirectModal.show();
      }
    });
});
