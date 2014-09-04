var React = require('react');
var {merge} = require('../actions/utils');

var Header = React.createClass({
  render: function() {
    return React.DOM.header({key: 'header'},
      React.DOM.div({className: 'Header-title'}, React.DOM.h1({}, 'Peart')),
      Transport(merge(this.props, {key: 'transport'})));
  }
});

var Transport = React.createClass({
  render: function() {
    return React.DOM.div({className: 'Header-transport'},
      TempoSlider(merge(this.props, {
        key: 'tempo',
        title: 'tempo',
        value: this.props.tempo}
      )),
      SwingSlider(merge(this.props, {
        key: 'swing',
        title: 'swing',
        value: this.props.swing}
      )),
      ResetLink(merge(this.props, {key: 'resetLink'})),
      AddChannelLink(merge(this.props, {key: 'addChannelLink'})),
      PlayLink(merge(this.props, {key: 'playLink'}))
    );
  }
});

var TempoSlider = React.createClass({
  onChange: function(event) {
    this.props.setTempo(event.target.value);
  },
  render: function() {
    return (
      React.DOM.div({},
        React.DOM.label({htmlFor: this.props.key}, this.props.title),
        React.DOM.input({
          id: this.props.key,
          type: 'range',
          value: this.props.value,
          min: '40',
          max: '200',
          step: '1',
          onChange: this.onChange
        })
      )
    );
  }
});

var SwingSlider = React.createClass({
  onChange: function(event) {
    this.props.setSwing(event.target.value);
  },
  render: function() {
    return (
      React.DOM.div({},
        React.DOM.label({htmlFor: this.props.key}, this.props.title),
        React.DOM.input({
          id: this.props.key,
          type: 'range',
          value: this.props.value,
          min: '0',
          max: '1',
          step: '0.1',
          onChange: this.onChange
        })
      )
    );
  }
});

var ResetLink = React.createClass({
  onClick: function() {
    this.props.resetState();
  },
  render: function() {
    return React.DOM.a({className: 'Button', onClick: this.onClick}, 'reset');
  }
});

var AddChannelLink = React.createClass({
  onClick: function() {
    this.props.addToChannelList();
  },
  render: function() {
    return React.DOM.a({
      className: 'Button',
      onClick: this.onClick},
        'add channel');
  }
});

var PlayLink = React.createClass({
  onClick: function() {
    this.props.setIsPlaying(!this.props.isPlaying);
  },
  render: function() {
    return React.DOM.a({
      className: 'Button Button--action',
      onClick: this.onClick},
        (this.props.isPlaying ? 'stop' : 'play'));
  }
});

module.exports = Header;
