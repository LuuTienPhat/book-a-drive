const codeSendAfter = document.getElementById("code-send-after");
const btnGetCode = document.getElementById("btn-get-code");
const code = document.getElementById("code");
const btnCheckCode = document.getElementById("btn-check-code");
const btnChangePassword = document.getElementById("btn-change-password");
const codeWarning = document.getElementById("code-warning");
const codePanel = document.getElementById("code-panel");

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
    .post(`http://localhost:3001/accounts/customers/check`, {
      email: email.value,
      username: username.value,
    })
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      console.log(data);
      if (data.email && data.username) {
        axios.post(`http://localhost:3001/accounts/customers/send`, {
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
    .post(`http://localhost:3001/accounts/customers/check`, {
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
  // console.log("run");
  checkPassword();
  checkPasswordRepeat();

  if (!password.classList.contains("is-valid")) return;
  if (!passwordRepeat.classList.contains("is-valid")) return;
  axios
    .patch(`http://localhost:3001/accounts/customers/`, {
      username: username.value,
      password: password.value,
      recoveryCode: code.value,
    })
    .then((res) => {
      if (res.status == 200 && !res.data.error) {
        passwordModal.hide();
        redirectModal.show();
      }
    });
});
