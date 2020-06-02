function generateMessage(message, username, id) {
  const date = new Date();
  return {
    message,
    created_at: date.getTime(),
    username,
    id,
  };
}

function generateLocationMessage(lat, long, username, id) {
  const date = new Date();
  return {
    url: `https://www.google.com/maps?q=${lat},${long}`,
    created_at: date.getTime(),
    username,
    id,
  };
}

module.exports = {
  generateMessage,
  generateLocationMessage,
};
