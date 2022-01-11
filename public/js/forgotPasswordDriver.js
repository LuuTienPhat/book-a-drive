const code = document.getElementById("code");
const btnGetCode = document.getElementById("btn-get-code");
const codeSendAfter = document.getElementById("code-send-after");
const codePanel = document.getElementById("code-panel");
const btnCheckCode = document.getElementById("btn-check-code");
const codeWarning = document.getElementById("code-warning");
const btnChangePassword = document.getElementById("btn-change-password");

email.addEventListener("input", checkEmail);
username.addEventListener("input", checkUsername);
password.addEventListener("input", checkPassword);
passwordRepeat.addEventListener("input", checkPasswordRepeat);
identityNumber.addEventListener("input", checkIdentityNumber);

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

btnGetCode.addEventListener("click", () => {
  checkEmail();
  checkUsername();
  checkIdentityNumber();
  if (!email.classList.contains("is-valid")) return;
  if (!username.classList.contains("is-valid")) return;
  if (!identityNumber.classList.contains("is-valid")) return;
  axios
    .post(`http://localhost:3001/accounts/drivers/check`, {
      email: email.value,
      identityNumber: identityNumber.value,
      username: username.value,
    })
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      console.log(data);
      if (data.email && data.identityNumber && data.username) {
        axios.post(`http://localhost:3001/accounts/drivers/send`, {
          identityNumber: identityNumber.value,
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
    .post(`http://localhost:3001/accounts/drivers/check`, {
      identityNumber: identityNumber.value,
      email: email.value,
      username: username.value,
      recoveryCode: code.value,
    })
    .then((res) => {
      return res.data;
    })
    .then((data) => {
      console.log(data);
      if (
        data.identityNumber &&
        data.email &&
        data.username &&
        data.recoveryCode
      ) {
        passwordModal.show();
      } else {
        code.classList.add("is-invalid");
        code.classList.remove("is-valid");
        codeWarning.innerHTML = "Mã khôi phục sai";
      }
    });
});

btnChangePassword.addEventListener("click", () => {
  checkPassword();
  checkPasswordRepeat();

  if (!password.classList.contains("is-valid")) return;
  if (!passwordRepeat.classList.contains("is-valid")) return;
  axios
    .patch(`http://localhost:3001/accounts/drivers/`, {
      username: username.value,
      password: password.value,
      recoveryCode: code.value,
    })
    .then((res) => {
      if (res.status == 200 && !res.data.error) {
        passwordModal.hide();
        redirectModal.show();
      } else {
        passwordModal.show();
      }
    });
});
