var React = require('react');
var _ = require('lodash');

var Header = require('./header');
var Channels = require('./channels');
var Footer = require('./footer');

var initialState = require('../constants/initial-state');
var utils = require('../actions/utils');

var timerID = 0;
var current16thNote = 0;
var nextNoteTime = 0;

var App = React.createClass({
  render: function() {
    return (
      React.DOM.div({className: 'Site'},
        Header({
          tempo: this.props.data.tempo,
          swing: this.props.data.swing,
          isPlaying: this.props.data.isPlaying,
          setIsPlaying: this.setIsPlaying,
          resetState: this.resetState,
          addToChannels: this.addToChannels
        }),
        React.DOM.main({key: 'main'},
          Channels({
            channels: this.props.data.channels,
            samplePaths: this.props.data.samplePaths,
            audioContext: this.props.audioContext
          })
        ),
        Footer({key: 'footer'})
      )
    );
  },
  componentDidMount: function() {
    // We don't want to autoplay.
    this.setIsPlaying(false);
  },
  addToChannels: function() {
    this.props.data.channels.push({
      id: utils.generateId(),
      volume: 1,
      pitch: 0.5,
      pan: 0,
      samplePath: 'static/samples/707_BD0.wav',
      // Empty stereo buffer as default until sample loads.
      // 22050 frames / 44100 Hz = 0.5 seconds.
      buffer: this.props.audioContext.createBuffer(
        2,
        this.props.audioContext.sampleRate / 2,
        this.props.audioContext.sampleRate
      ),
      sequence: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      isMuted: false
    });
  },
  resetState: function() {
    this.setIsPlaying(false);
    this.props.data.set(_.cloneDeep(initialState));
  },
  componentDidUpdate: function(prevProps, prevState) {
    localStorage.setItem('state', JSON.stringify(this.props.data.getValue()));
  },
  setIsPlaying: function(isPlaying) {
    this.props.data.isPlaying.set(isPlaying);
    this.updatePlayback();
  },
  advanceNote: function() {
    var secondsPerBeat = 60.0 / this.props.data.tempo.getValue();
    if (++current16thNote === 16) {
      current16thNote = 0;
    }
    nextNoteTime += (current16thNote % 2 ?
      (0.25 + 0.08 * this.props.data.swing.getValue()) * secondsPerBeat :
      (0.25 - 0.08 * this.props.data.swing.getValue()) * secondsPerBeat);
  },
  updatePlayback: function() {
    if (this.props.data.isPlaying.getValue()) {
      current16thNote = 0;
      nextNoteTime = this.props.audioContext.currentTime;
      this.schedule();
    } else {
      window.clearTimeout(timerID);
    }
  },
  schedule: function() {
    while (nextNoteTime < this.props.audioContext.currentTime + 0.100) {
      this.checkSequence();
      this.advanceNote();
    }
    timerID = window.setTimeout(this.schedule, 25.0);
  },
  checkSequence: function() {
    this.props.data.channels.forEach(function(channel) {
      if (channel.sequence[current16thNote].getValue() === 1) {
        this.scheduleSound(nextNoteTime, channel);
      }
    }.bind(this));
  },
  scheduleSound: function(time, channel) {
    var source = this.props.audioContext.createBufferSource();
    source.buffer = channel.buffer.getValue();

    // Min rate = 0.5, max rate = 2.0.
    var rate = Math.pow(
      2.0, 2.0 * (channel.pitch.getValue() - 0.5));
    source.playbackRate.value = rate;

    var panner = this.props.audioContext.createPanner();
    panner.panningModel = 'equalpower';
    panner.setPosition(
      channel.pan.getValue(),
      0,
      (1 - Math.abs(channel.pan.getValue())));

    // Prevent clipping when panned.
    var gainNode = this.props.audioContext.createGain();
    gainNode.gain.value = (channel.isMuted.getValue() ?
      0 : (channel.volume.getValue() * 0.8));

    source.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(this.props.audioContext.destination);

    source.start(time);
    source.stop(time +
      (source.buffer.duration * Math.pow(source.playbackRate.value, -1)));
  }
});

module.exports = App;
