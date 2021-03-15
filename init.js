let users;

const getUsers = async () => {
  await fetch("https://server-group21.herokuapp.com/users")
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      users = res.data;
      console.log(users);
    })
    .catch((err) => {
      console.log(err);
    });
};

getUsers();
