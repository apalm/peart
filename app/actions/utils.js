var generateId = function() {
  var id = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++) {
    id += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return id;
};

var lookupChannelIndex = function(channelList, channelId) {
  var lookup = {};
  for (var i = 0, len = channelList.length; i < len; i++) {
    lookup[channelList[i].id] = channelList[i];
  }

  return channelList.indexOf(lookup[channelId]);
};

var merge = (...args) => Object.assign({}, ...args);

module.exports = {
  generateId,
  lookupChannelIndex,
  merge
};
