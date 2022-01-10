const checkAll = () => {
  checkFirstName();
  checkLastname();
  checkPhone();
  checkEmail();
  checkUsernameCustomer();
  checkPassword();
  checkPasswordRepeat();
};

lastname.addEventListener("input", checkLastname);
firstname.addEventListener("input", checkFirstName);
email.addEventListener("input", checkEmail);
phone.addEventListener("input", checkPhone);
username.addEventListener("input", checkUsernameCustomer);
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

const button = document.getElementById("button");
button.addEventListener("click", () => {
  if (!checkValid()) {
    checkAll();
    modal.show();
    return;
  } else {
    axios
      .put(`http://localhost:3001/customers`, {
        firstname: firstname.value,
        lastname: lastname.value,
        phone: phone.value,
        email: email.value,
      })
      .then((res) => res.data)
      .then((data) => {
        const customerId = data.customerId;
        axios
          .put(`http://localhost:3001/accounts/customers`, {
            customerId: customerId,
            username: username.value,
            password: password.value,
          })
          .then((res) => res.data)
          .then((data) => (window.location.href = data.url));
      })
      .catch((error) => console.log(error));
  }
});
