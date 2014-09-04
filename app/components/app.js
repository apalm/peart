var React = require('react');
var _ = require('lodash');

var Header = require('./header');
var Channels = require('./channels');
var Footer = require('./footer');

var initialState = require('../constants/initial-state');
var utils = require('../actions/utils');
var {merge} = require('../actions/utils');

var timerID = 0;
var current16thNote = 0;
var nextNoteTime = 0;

var App = React.createClass({
  getInitialState: function() {
    return (localStorage.getItem('state') === null ?
      _.cloneDeep(initialState) : JSON.parse(localStorage.getItem('state')));
  },
  render: function() {
    return React.DOM.div({
      className: 'Site',
      children: [
        this.getHeader(),
        this.getMain(),
        this.getFooter()
      ]
    });
  },
  getHeader: function() {
    //return Header(React.addons.update(this.state, {$merge: {
    return Header(merge(this.state, {
      setIsPlaying: this.setIsPlaying,
      setTempo: this.setTempo,
      setSwing: this.setSwing,
      resetState: this.resetState,
      addToChannelList: this.addToChannelList
    }));
  },
  getMain: function() {
    return React.DOM.main({
      key: 'main',
      children: [
        this.getChannels()
      ]
    });
  },
  getFooter: function() {
    return Footer({key: 'footer'});
  },
  getChannels: function() {
    return Channels(merge(this.state, {
      setSamplePath: this.setSamplePath,
      setChannelList: this.setChannelList
    }));
  },
  componentDidMount: function() {
    // We don't want to autoplay.
    this.setIsPlaying(false);
  },
  addToChannelList: function() {
    var channelList = this.state.channelList.slice(0);
    channelList.push({
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
    this.setChannelList(channelList);
  },
  resetState: function() {
    this.setState(_.cloneDeep(initialState));
  },
  componentDidUpdate: function(prevProps, prevState) {
    if (this.state.isPlaying && !this.state.channelList.length) {
      this.setIsPlaying(false);
    }
    localStorage.setItem('state', JSON.stringify(this.state));
  },
  setIsPlaying: function(isPlaying) {
    this.setState({isPlaying: isPlaying}, this.updatePlayback);
  },
  setTempo: function(tempo) {
    this.setState({tempo: tempo});
  },
  setSwing: function(swing) {
    this.setState({swing: swing});
  },
  setIsMute: function(isMute) {
    this.setState({isMute: isMute});
  },
  setSamplePath: function(channelList, samplePath, channelId) {
    this.setState({channelList: channelList},
      this.setBuffer.bind(null, channelList, samplePath, channelId));
  },
  setBuffer: function(channelList, samplePath, channelId) {
    var request = new XMLHttpRequest();
    request.open('GET', samplePath, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      this.props.audioContext.decodeAudioData(request.response, function(buf) {
        var channelList = this.state.channelList.slice(0);
        channelList[utils.lookupChannelIndex(channelList, channelId)]
          .buffer = buf;
        this.setChannelList(channelList);
      }.bind(this));
    }.bind(this);
    request.send();
  },
  setChannelList: function(channelList) {
    this.setState({channelList: channelList});
  },
  advanceNote: function() {
    var secondsPerBeat = 60.0 / this.state.tempo;

    if (++current16thNote === 16) {
      current16thNote = 0;
    }

    nextNoteTime += (current16thNote % 2 ?
      (0.25 + 0.08 * this.state.swing) * secondsPerBeat :
      (0.25 - 0.08 * this.state.swing) * secondsPerBeat);
  },
  updatePlayback: function() {
    if (this.state.isPlaying) {
      current16thNote = 0;
      nextNoteTime = this.props.audioContext.currentTime;
      this.schedule();
    } else {
      window.clearTimeout(timerID);
    }
  },
  schedule: function() {
    while (nextNoteTime < this.props.audioContext.currentTime + 0.100) {
      for (var i = 0; i < this.state.channelList.length; i++) {
        if (this.state.channelList[i].sequence[current16thNote] === 1) {
          this.scheduleSound(nextNoteTime, i);
        }
      }
      this.advanceNote();
    }
    timerID = window.setTimeout(this.schedule, 25.0);
  },
  scheduleSound: function(time, i) {
    var source = this.props.audioContext.createBufferSource();
    source.buffer = this.state.channelList[i].buffer;

    // Min rate = 0.5, max rate = 2.0.
    var rate = Math.pow(2.0, 2.0 * (this.state.channelList[i].pitch - 0.5));
    source.playbackRate.value = rate;

    var panner = this.props.audioContext.createPanner();
    panner.panningModel = 'equalpower';
    panner.setPosition(
      this.state.channelList[i].pan,
      0,
      (1 - Math.abs(this.state.channelList[i].pan)));

    // Prevent clipping when panned.
    var gainNode = this.props.audioContext.createGain();
    gainNode.gain.value = (this.state.channelList[i].isMuted ?
      0 : (this.state.channelList[i].volume * 0.8));

    source.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(this.props.audioContext.destination);

    source.start(time);
    // Prevent sample from being cut off when playback rate < 1.
    // Multiply by 2, since min playback rate = 0.5.
    source.stop(time + source.buffer.duration * 2);
  }
});

module.exports = App;
