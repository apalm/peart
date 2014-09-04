require('es6ify/node_modules/traceur/bin/traceur-runtime');

var React = require('react/addons');
var App = require('./components/app');

var audioContext = new AudioContext();

React.renderComponent(App({audioContext: audioContext}), document.body);
