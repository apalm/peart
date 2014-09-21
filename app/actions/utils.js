var generateId = function() {
  var id = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
};

module.exports = {generateId};
