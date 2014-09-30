var React = require('react');

var Channels = React.createClass({
  render: function() {
    var channelNodes = this.props.channels.map(function(channel, i) {
      return Channel({
        key: 'channel' + i,
        channel: channel,
        channels: this.props.channels,
        samplePaths: this.props.samplePaths,
        audioContext: this.props.audioContext
      });
    }.bind(this));

    return (
      React.DOM.div(null, channelNodes)
    );
  }
});

var Channel = React.createClass({
  render: function() {
    return (
      React.DOM.div({className: 'Grid'},
        StepSequencer({
          key: 'sequence',
          sequence: this.props.channel.sequence
        }),
        React.DOM.div({className: 'Grid'},
          SampleSelect({
            key: 'sampleSelect',
            samplePath: this.props.channel.samplePath,
            buffer: this.props.channel.buffer,
            samplePaths: this.props.samplePaths,
            audioContext: this.props.audioContext
          }),
          ChannelSlider({
            key: 'volume',
            title: 'volume',
            value: this.props.channel.volume,
            min: 0,
            max: 1
          }),
          ChannelSlider({
            key: 'pitch',
            title: 'pitch',
            value: this.props.channel.pitch,
            min: 0,
            max: 1
          }),
          ChannelSlider({
            key: 'pan',
            title: 'pan',
            value: this.props.channel.pan,
            min: -1,
            max: 1
          }),
          MuteLink({
            key: 'isMuted',
            title: 'mute',
            value: this.props.channel.isMuted
          }),
          DeleteLink({
            key: 'delete',
            title: 'delete',
            channels: this.props.channels,
            value: this.props.channel.id
          })
        )
      )
    );
  }
});

var StepSequencer = React.createClass({
  onClick: function(stepIndex) {
    this.props.sequence.removeAt(stepIndex);
    this.props.sequence.insertAt(
      stepIndex, (this.props.sequence[stepIndex].getValue() ? 0 : 1));
  },
  render: function() {
    var stepNodes = this.props.sequence.map(function(note, i) {
      var classes = React.addons.classSet({
        'Button': true,
        'Button--on': note.getValue()
      });
      return React.DOM.div({className: 'Grid-cell', key: 'step' + i},
        React.DOM.a({
          className: classes,
          onClick: this.onClick.bind(null, i)
        }, '\u00a0'));
    }.bind(this));

    return (
      React.DOM.div({className: 'Grid'}, stepNodes)
    );
  }
});

var SampleSelect = React.createClass({
  // Force initial buffer load.
  componentDidMount: function() {
    this.loadBuffer(this.props.samplePath.getValue());
  },
  onChange: function(event) {
    this.props.samplePath.set(event.target.value);
    this.loadBuffer(event.target.value);
  },
  loadBuffer: function(samplePath) {
    var request = new XMLHttpRequest();
    request.open('GET', samplePath, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      this.props.audioContext.decodeAudioData(request.response, function(buf) {
        this.props.buffer.set(buf);
      }.bind(this));
    }.bind(this);
    request.send();
  },
  render: function() {
    var optionNodes = this.props.samplePaths.map(function(path, i) {
      // The name of the sample follows 'static/samples/'.
      var sampleName = path.getValue().substr(15);
      return React.DOM.option({
        key: 'option' + i,
        value: path.getValue(),
      }, sampleName);
    });

    return (
      React.DOM.div({className: 'Grid-cell'},
        React.DOM.select({
          value: this.props.samplePath.getValue(),
          onChange: this.onChange
        }, optionNodes)
      )
    );
  }
});

var ChannelSlider = React.createClass({
  onChange: function(event) {
    this.props.value.set(event.target.value);
  },
  render: function() {
    return (
      React.DOM.div({className: 'Grid-cell', key: this.props.key},
        React.DOM.label({htmlFor: this.props.key}, this.props.title),
        React.DOM.input({
          id: this.props.key,
          type: 'range',
          value: this.props.value.getValue(),
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
    this.props.value.set(!this.props.value.getValue());
  },
  render: function() {
    var classes = React.addons.classSet({
      'Button': true,
      'Button--on': this.props.value.getValue()
    });
    return (
      React.DOM.div({className: 'Grid-cell'},
        React.DOM.a({className: classes, onClick: this.onClick},
          (this.props.value.getValue() ? 'unmute' : 'mute')
        )
      )
    );
  }
});

var DeleteLink = React.createClass({
  onClick: function() {
    var index = this.props.channels.findIndex(function(channel) {
      return channel.id.getValue() === this.props.value.getValue();
    }.bind(this));
    this.props.channels.removeAt(index);
  },
  render: function() {
    return (
      React.DOM.div({className: 'Grid-cell'},
        React.DOM.a({
          className: 'Button Button--danger',
          onClick: this.onClick
        }, this.props.title)
      )
    );
  }
});

module.exports = Channels;
