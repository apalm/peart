var React = require('react');
var Recorder = require('recorderjs');

var Header = React.createClass({
  render: function() {
    return (
      React.DOM.header({key: 'header'},
        React.DOM.div({className: 'Header-title'}, React.DOM.h1(null, 'Peart')),
        Transport({
          key: 'transport',
          tempo: this.props.tempo,
          swing: this.props.swing,
          audioContext: this.props.audioContext,
          masterGain: this.props.masterGain,
          isPlaying: this.props.isPlaying,
          setIsPlaying: this.props.setIsPlaying,
          resetState: this.props.resetState,
          addToChannels: this.props.addToChannels
        })
      )
    );
  }
});

var Transport = React.createClass({
  render: function() {
    return (
      React.DOM.div({className: 'Header-transport'},
        HeaderSlider({
          key: 'tempo',
          title: 'tempo',
          value: this.props.tempo,
          min: '40',
          max: '200',
          step: '1'
        }),
        HeaderSlider({
          key: 'swing',
          title: 'swing',
          value: this.props.swing,
          min: '0',
          max: '1',
          step: '0.1'
        }),
        RecordLink({
          audioContext: this.props.audioContext,
          masterGain: this.props.masterGain,
          isPlaying: this.props.isPlaying
        }),
        ResetLink({
          key: 'resetLink',
          resetState: this.props.resetState
        }),
        AddChannelLink({
          key: 'addChannelLink',
          addToChannels: this.props.addToChannels
        }),
        PlayLink({
          key: 'playLink',
          isPlaying: this.props.isPlaying,
          setIsPlaying: this.props.setIsPlaying
        })
      )
    );
  }
});

var HeaderSlider = React.createClass({
  onChange: function(event) {
    this.props.value.set(event.target.value);
  },
  render: function() {
    return (
      React.DOM.div(null,
        React.DOM.label({htmlFor: this.props.key}, this.props.title),
        React.DOM.input({
          id: this.props.key,
          type: 'range',
          value: this.props.value.getValue(),
          min: this.props.min,
          max: this.props.max,
          step: this.props.step,
          onChange: this.onChange
        })
      )
    );
  }
});

var RecordLink = React.createClass({
  getInitialState: function() {
    return {
      isRecording: false,
      recorder: new Recorder(this.props.masterGain)
    };
  },
  onClick: function() {
    if (!this.state.isRecording) {
      this.setState({isRecording: true});
      this.state.recorder.record();
    } else {
      this.setState({isRecording: false});
      this.state.recorder.exportWAV(function(blob) {
        Recorder.forceDownload(blob);
      });
      this.state.recorder.clear();
    }
  },
  render: function() {
    return (
      React.DOM.a({
        className: 'Button',
        onClick: this.onClick
      }, (this.state.isRecording ? 'stop recording' : 'record'))
    );
  }
});

var ResetLink = React.createClass({
  onClick: function() {
    this.props.resetState();
  },
  render: function() {
    return (
      React.DOM.a({className: 'Button', onClick: this.onClick}, 'reset')
    );
  }
});

var AddChannelLink = React.createClass({
  onClick: function() {
    this.props.addToChannels();
  },
  render: function() {
    return (
      React.DOM.a({className: 'Button', onClick: this.onClick}, 'add channel')
    );
  }
});

var PlayLink = React.createClass({
  onClick: function() {
    this.props.setIsPlaying(!this.props.isPlaying.getValue());
  },
  render: function() {
    return React.DOM.a({
      className: 'Button Button--action',
      onClick: this.onClick
    }, (this.props.isPlaying.getValue() ? 'stop' : 'play'));
  }
});

module.exports = Header;
