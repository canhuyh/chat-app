let users = [];

function createUser(_id, username, room) {
  //validate user
  if (getUserInfoByUsername(username, room)) {
    return false;
  }
  const user = {
    _id,
    username,
    room,
  };
  users.push(user);
  return true;
}

const getUserInfoByUsername = (username, room) => {
  const user = users.find((_user) => {
    return username === _user.username && room === _user.room;
  });

  return user; //username,room
};

const getUserInfo = (id) => {
  const user = users.find((_user) => {
    return id === _user._id;
  });

  return user; //username,room
};

const getUsersInRoom = (room) => {
  // [{username,room}]
  const user_in_room = users.filter((user) => {
    return user.room === room;
  });
  return user_in_room;
};

const removeUser = (_id) => {
  users = users.filter((user) => {
    return user._id != _id;
  });
};

module.exports = {
  createUser,
  getUserInfo,
  getUsersInRoom,
  removeUser,
};
