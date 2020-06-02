//phía client
const socket = io();

//elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");
const $form = document.querySelector("#form");

//templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sidebarRoom = document.querySelector("#sidebar-template-room");
//
const { username, room, id } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//auto scrolling
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message_info) => {
  console.log(message_info);
  const { message, created_at, username: _username, id } = message_info;
  const isMyMessage = socket.id === id;

  const html = Mustache.render(messageTemplate, {
    message, //string
    created_at: moment(created_at).format("hh:mm A"),
    username: _username,
    right: isMyMessage ? "right" : "",
  });
  $messages.innerHTML = $messages.innerHTML + html;
  autoscroll();
});

socket.on("locationMessage", (locationMessage) => {
  const { url, created_at, username: user_name, id } = locationMessage;
  const isMyMessage = socket.id === id;
  const html = Mustache.render(locationMessageTemplate, {
    url,
    created_at: moment(created_at).format("hh:mm A"),
    username: user_name,
    right: isMyMessage ? "right" : "",
  });
  $messages.innerHTML = $messages.innerHTML + html;
  autoscroll();
});

// client (emit) => server (receive/on) ==acknowledgement=> client
// server (emit) => client (receive/on) ==acknowledgement=> server

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  //disable button
  $messageFormButton.setAttribute("disabled", "disabled");

  const message = event.target.elements.message.value;
  if (message.trim() === "") {
    $messageButton.removeAttribute("disabled");
    return;
  }
  //message là name của input, target chính là cái form đang xét, elemets là những element trong form
  socket.emit("sendMessage", message, (error) => {
    //enable button
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return alert(error);
    }
    console.log("Message was delivered!!!");
  });
});

// document.querySelector("#increment").addEventListener("click", () => {
//   console.log("CLICKED!");
//   socket.emit("increment");
// });

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!!!");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      lat: position.coords.latitude,
      long: position.coords.longitude,
    };
    socket.emit("sendLocation", location, () => {
      $sendLocationButton.removeAttribute("disabled");
      console.log("Location Share!");
    });
    //console.log(position);
  });
});
//
socket.emit(
  "joinRoom",
  {
    username,
    room,
  },
  (error) => {
    if (error) {
      //redirect về trang login
      window.location = "../index.html";
      return alert(error);
    }
  }
);

socket.on("roomData", ({ room, users }) => {
  console.log(room, users);

  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  $sidebar.innerHTML = html;
});
