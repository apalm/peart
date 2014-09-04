var React = require('react');
var {merge} = require('../actions/utils');
var {getActiveStyle} = require('../actions/style');

var Channels = React.createClass({
  render: function() {
    var channelNodes = this.props.channelList.map(function(channel, i) {
      return Channel(merge(this.props, {key: 'channel' + i, index: i}));
    }.bind(this));

    return React.DOM.div({}, channelNodes);
  }
});

var Channel = React.createClass({
  render: function() {
    return React.DOM.div({
      className: 'Grid',
      children: [
        StepSequencer(merge(this.props, {
          key: 'sequence',
          sequence: this.props.channelList[this.props.index].sequence
        })),
        React.DOM.div({className: 'Grid'},
          SampleSelect(merge(this.props, {
            key: 'sampleSelect',
            value: this.props.channelList[this.props.index].samplePath,
            id: this.props.channelList[this.props.index].id
          })),
          ChannelSlider(merge(this.props, {
            key: 'volume',
            title: 'volume',
            value: this.props.channelList[this.props.index].volume,
            min: 0,
            max: 1
          })),
          ChannelSlider(merge(this.props, {
            key: 'pitch',
            title: 'pitch',
            value: this.props.channelList[this.props.index].pitch,
            min: 0,
            max: 1
          })),
          ChannelSlider(merge(this.props, {
            key: 'pan',
            title: 'pan',
            value: this.props.channelList[this.props.index].pan,
            min: -1,
            max: 1
          })),
          MuteLink(merge(this.props, {
            key: 'isMuted',
            title: 'mute',
            value: this.props.channelList[this.props.index].isMuted
          })),
          DeleteLink(merge(this.props, {
            key: 'delete',
            title: 'delete',
            id: this.props.channelList[this.props.index].id
          })))
      ]});
  }
})

var StepSequencer = React.createClass({
  onClick: function(stepIndex) {
    var channelList = this.props.channelList.slice(0);
    var stepValue = (this.props.sequence[stepIndex] ? 0 : 1);
    channelList[this.props.index].sequence[stepIndex] = stepValue;
    this.props.setChannelList(channelList);
  },
  render: function() {
    var stepNodes = this.props.sequence.map(function(note, i) {
      return React.DOM.div({className: 'Grid-cell', key: 'step' + i},
        React.DOM.a({
          style: getActiveStyle(note),
          className: 'Button',
          onClick: this.onClick.bind(null, i)
        }, '\u00a0'));
    }.bind(this));

    return React.DOM.div({className: 'Grid'}, stepNodes);
  }
});

var SampleSelect = React.createClass({
  // Force initial buffer load.
  componentDidMount: function() {
    this.props.setSamplePath(this.props.channelList, this.props.value, this.props.id);
  },
  onChange: function(event) {
    var channelList = this.props.channelList.slice(0);
    channelList[this.props.index].samplePath = event.target.value;
    this.props.setSamplePath(channelList, event.target.value, this.props.id);
  },
  render: function() {
    var optionNodes = this.props.samplePaths.map(function(path, i) {
      // The name of the sample follows 'static/samples/'.
      var sampleName = path.substr(15);
      return React.DOM.option({key: 'option' + i, value: path}, sampleName);
    });

    return React.DOM.div({className: 'Grid-cell'},
      React.DOM.select({
        value: this.props.value,
        onChange: this.onChange}, optionNodes))
  }
});


var ChannelSlider = React.createClass({
  onChange: function(event) {
    var channelList = this.props.channelList.slice(0);
    channelList[this.props.index][this.props.key] = event.target.value;
    this.props.setChannelList(channelList);
  },
  render: function() {
    return (
      React.DOM.div({className: 'Grid-cell', key: this.props.key},
        React.DOM.label({htmlFor: this.props.key}, this.props.title),
        React.DOM.input({
          id: this.props.key,
          type: 'range',
          value: this.props.value,
          min: this.props.min,
          max: this.props.max,
          step: '0.1',
          onChange: this.onChange
        })
      )
    );
  }
});

var MuteLink = React.createClass({
  onClick: function() {
    var channelList = this.props.channelList.slice(0);
    channelList[this.props.index][this.props.key] = !channelList[this.props.index][this.props.key];
    this.props.setChannelList(channelList);
  },
  render: function() {
    return React.DOM.div({className: 'Grid-cell'},
      React.DOM.a({
        className: 'Button',
        style: getActiveStyle(this.props.value),
        onClick: this.onClick}, (this.props.value ? 'unmute' : 'mute')))
  }
});

var DeleteLink = React.createClass({
  onClick: function() {
    var channelList = this.props.channelList.slice(0);
    channelList = channelList.filter(function(channel) {
      return channel.id !== this.props.id;
    }.bind(this));
    this.props.setChannelList(channelList);
  },
  render: function() {
    return React.DOM.div({className: 'Grid-cell'},
      React.DOM.a({
        className: 'Button Button--danger',
        onClick: this.onClick}, this.props.title))
  }
});

module.exports = Channels;
