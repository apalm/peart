require('es6ify/node_modules/traceur/bin/traceur-runtime');

var React = require('react/addons');
var _ = require('lodash');
var Cortex = require('cortexjs');

var initialState = require('./constants/initial-state');
var App = require('./components/app');

var audioContext = new AudioContext();

var state = (localStorage.getItem('state') === null ?
  _.cloneDeep(initialState) : JSON.parse(localStorage.getItem('state')));
var cortex = new Cortex(state);

var root = React.renderComponent(
  App({audioContext: audioContext, data: cortex}),
  document.body
);

cortex.on('update', function(data) {
  root.setProps({data: data});
});
