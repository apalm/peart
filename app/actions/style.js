function getActiveStyle(isActive) {
  var style = {};
  style.background =
    (isActive ? 'hsla(31, 15%, 50%, 0.25)' : 'hsla(31, 15%, 50%, 0.15)');
  return style;
}

module.exports = {getActiveStyle};
