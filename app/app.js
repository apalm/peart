var React = require("react");

var audioContext = new AudioContext();

var timerID = 0;
var current16thNote = 0;
var nextNoteTime = 0;

var App = React.createClass({

  getInitialState: function() {
    return {
      tempo: 120,
      swing: 0.0,
    };
  },

  componentWillMount: function() {
    window.addEventListener("transport:update", this.updateState, false);
  },

  componentWillUnmount: function() {
    window.removeEventListener("transport:update", this.updateState, false);
  },

  updateState: function(event) {
    var state = this.state[event.detail.propName];
    state = event.detail.value;

    switch (event.detail.propName) {
      case "tempo":
        this.setState({tempo: state});
        break;
      case "swing":
        this.setState({swing: state});
        break;
    }
  },

  render: function() {
    return (
      React.DOM.div({className: "Site"},
        NavBar({
          tempo: this.state.tempo,
          swing: this.state.swing,
        }),
        React.DOM.main({className: "Site-content Container"},
          ChannelListBox({
            audioContext: audioContext,
            tempo: this.state.tempo,
            swing: this.state.swing
          })
        ),
        Footer({})
      )
    );
  }

});

var Footer = React.createClass({

  render: function() {
    return (
      React.DOM.footer({className: "Footer"},
        React.DOM.div({className: "Footer-credits"},
          React.DOM.span({className: "Footer-credit"},
            "Created by ",
            React.DOM.a({href: "//github.com/apalm"}, "apalm"), "."
          ),
          React.DOM.span({className: "Footer-credit"},
            "View project source on ",
            React.DOM.a({href: "//github.com/apalm/peart"}, "GitHub"), "."
          )
        )
      )
    );
  }

});

var NavBar = React.createClass({

  render: function() {
    return (
      React.DOM.div({},
        React.DOM.header({className: "Header Header--cozy", role: "banner"},
          React.DOM.div({className: "Header-titles"},
            React.DOM.h1({className: "Header-title"},
              React.DOM.a({href: "#"}, "Peart")
            )
          ),
          TransportBox({tempo: this.props.tempo, swing: this.props.swing})
        )
      )
    );
  }

});

var TransportBox = React.createClass({

  getInitialState: function() {
    return {isPlaying: false};
  },

  componentWillMount: function() {
    window.addEventListener("playback:update", this.updatePlayback, false);
  },

  componentWillUnmount: function() {
    window.removeEventListener("playback:update", this.updatePlayback, false);
  },

  updatePlayback: function(event) {
    this.setState({isPlaying: event.detail.value});
  },

  render: function() {
    return (
      React.DOM.div({className: "Header-actions", ref: "transportBox"},
        TransportSliderBox({
          value: this.props.tempo,
          key: "tempo",
          propName: "tempo",
          min: "20",
          max: "300",
          step: "1"
        }),
        TransportSliderBox({
          value: this.props.swing,
          key: "swing",
          propName: "swing",
          min: "0",
          max: "1",
          step: "0.05"
        }),
        Transport({
          isPlaying: this.state.isPlaying,
          key: "transport",
          propName: "isPlaying"
        })
      )
    );
  }

});

var TransportSliderBox = React.createClass({

  onSliderChange: function(event) {
    var updateEvent = new CustomEvent("transport:update", {
      detail: {
        value: event.target.value,
        propName: this.props.propName
      },
      bubbles: true
    });

    this.refs[this.props.key].getDOMNode().dispatchEvent(updateEvent);
  },

  render: function() {
    return (
      React.DOM.div({className: "transportSliderBox", ref: this.props.key},
        React.DOM.label({htmlFor: this.props.key}, this.props.propName),
        React.DOM.input({
          id: this.props.key,
          type: "range",
          value: this.props.value,
          min: this.props.min,
          max: this.props.max,
          step: this.props.step,
          onChange: this.onSliderChange
        })
      )
    );
  }

});

var Transport = React.createClass({

  onButtonClick: function(event) {
    var isPlaying = this.props.isPlaying;
    var updateEvent = new CustomEvent("playback:update", {
      detail: {
        value: !isPlaying,
        propName: this.props.propName
      },
      bubbles: true
    });

    this.refs[this.props.key].getDOMNode().dispatchEvent(updateEvent);
  },

  render: function() {
    return (
      React.DOM.button({
        ref: this.props.key,
        className: "button radius",
        style: {background: (this.props.isPlaying ? "#c60f13" :"#5da423")},
        onClick: this.onButtonClick}, (this.props.isPlaying ? "stop" : "play")
      )
    );
  }

});

var ChannelListBox = React.createClass({

  getInitialState: function() {
    return {
      channelList: []
    };
  },

  componentWillMount: function() {
    window.addEventListener("channel:update", this.updateChannel, false);
    window.addEventListener("channel:updateBuffer", this.loadBuffer, false);
    window.addEventListener("channel:delete", this.deleteChannel, false);
    this.addToChannelList();
  },

  componentWillUnmount: function() {
    window.removeEventListener("channel:update", this.updateChannel, false);
    window.removeEventListener("channel:updateBuffer", this.loadBuffer, false);
    window.removeEventListener("channel:delete", this.deleteChannel, false);
  },

  updateChannel: function(event) {
    var channelList = this.state.channelList.slice(0);

    var lookup = {};
    for (var i = 0, len = channelList.length; i < len; i++) {
      lookup[channelList[i].id] = channelList[i];
    }
    var index = channelList.indexOf(lookup[event.detail.id]);
    channelList[index][event.detail.propName] = event.detail.value;
    this.setState({channelList: channelList});
  },

  loadBuffer: function(event) {
    var request = new XMLHttpRequest();
    request.open("GET", event.detail.samplePath, true);
    request.responseType = "arraybuffer";

    request.onload = function() {
      this.props.audioContext.decodeAudioData(request.response, function(buf) {
        var channelList = this.state.channelList.slice(0);
        var lookup = {};
        for (var i = 0, len = channelList.length; i < len; i++) {
          lookup[channelList[i].id] = channelList[i];
        }
        var index = channelList.indexOf(lookup[event.detail.id]);
        channelList[index][event.detail.propName] = buf;
        channelList[index].samplePath = event.detail.samplePath;
        this.setState({channelList: channelList});
      }.bind(this));
    }.bind(this)
    request.send();
  },

  deleteChannel: function(event) {
    var channelList = this.state.channelList.slice(0);
    channelList = channelList.filter(function(channel) {
      return channel.id !== event.detail.id;
    });
    this.setState({channelList: channelList});
  },

  generateId: function() {
    var id = "";
    var possible
      = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++) {
      id += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return id;
  },

  addToChannelList: function() {
    var channelList = this.state.channelList.slice(0);
    channelList.push({
      id: this.generateId(),
      volume: 1,
      pitch: 0.5,
      pan: 0,
      samplePaths: [
        "static/samples/707_BD0.wav",
        "static/samples/707_BD1.wav",
        "static/samples/707_COW.wav",
        "static/samples/707_CRS.wav",
        "static/samples/707_HCP.wav",
        "static/samples/707_HHC.wav",
        "static/samples/707_HHO.wav",
        "static/samples/707_HT.wav",
        "static/samples/707_LT.wav",
        "static/samples/707_MT.wav",
        "static/samples/707_RID.wav",
        "static/samples/707_RIM.wav",
        "static/samples/707_SD0.wav",
        "static/samples/707_SD1.wav",
        "static/samples/707_TAM.wav",
        "static/samples/cabasa.wav",
        "static/samples/chh.wav",
        "static/samples/clap.wav",
        "static/samples/conga.wav",
        "static/samples/congal.wav",
        "static/samples/cowb.wav",
        "static/samples/crash.wav",
        "static/samples/hitom.wav",
        "static/samples/kick1.wav",
        "static/samples/kick2.wav",
        "static/samples/linn_bp.wav",
        "static/samples/lotom.wav",
        "static/samples/midtom.wav",
        "static/samples/ohh.wav",
        "static/samples/ride.wav",
        "static/samples/sd1.wav",
        "static/samples/sd2.wav",
        "static/samples/sst.wav",
        "static/samples/tamb.wav"
      ],
      samplePath: "static/samples/707_BD0.wav",
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
    this.setState({channelList: channelList});
  },

  render: function() {
    return (
      React.DOM.div({className: "row channelList"},
        React.DOM.div({className: "small-16 columns"},
          React.DOM.button({
            className: "button radius expand",
            onClick: this.addToChannelList}, "+"),
          ChannelList({
            channelList: this.state.channelList,
            audioContext: this.props.audioContext,
            isPlaying: this.props.isPlaying,
            tempo: this.props.tempo,
            swing: this.props.swing
          })
        )
      )
    );
  }

});

var ChannelList = React.createClass({

  componentWillMount: function() {
    window.addEventListener("playback:update", this.updatePlayback, false);
  },

  componentWillUnmount: function() {
    window.removeEventListener("playback:update", this.updatePlayback, false);
  },

  updatePlayback: function(event) {
    if (event.detail.value) {
      current16thNote = 0;
      nextNoteTime = this.props.audioContext.currentTime;
      this.schedule();
    } else {
      window.clearTimeout(timerID);
    }
  },

  schedule: function() {
    while (nextNoteTime < this.props.audioContext.currentTime + 0.100) {
      for (var i = 0; i < this.props.channelList.length; i++) {
        if (this.props.channelList[i].sequence[current16thNote] === 1) {
          this.refs["channel" + i].playSound(nextNoteTime);
        }
      }
      this.advanceNote();
    }
    // Call schedule() every 25 ms.
    timerID = window.setTimeout(this.schedule, 25.0);
  },

  advanceNote: function() {
    var secondsPerBeat = 60.0 / this.props.tempo;

    if (++current16thNote === 16) {
      current16thNote = 0;
    }

    nextNoteTime += current16thNote % 2
      ? (0.25 + 0.08 * this.props.swing) * secondsPerBeat
      : (0.25 - 0.08 * this.props.swing) * secondsPerBeat;
  },

  render: function() {
    var channelNodes = this.props.channelList.map(function(channel, i) {
      return (
        Channel({
          id: channel.id,
          volume: channel.volume,
          pitch: channel.pitch,
          pan: channel.pan,
          samplePaths: channel.samplePaths,
          samplePath: channel.samplePath,
          buffer: channel.buffer,
          sequence: channel.sequence,
          isMuted: channel.isMuted,
          audioContext: this.props.audioContext,
          key: "channel" + i,
          ref: "channel" + i
        })
      );
    }.bind(this));

    return (
      React.DOM.div(null, channelNodes)
    );
  }

});

var Channel = React.createClass({

  playSound: function(time) {
    var source = this.props.audioContext.createBufferSource();
    source.buffer = this.props.buffer;

    // Min rate = 0.5, max rate = 2.0.
    var rate = Math.pow(2.0, 2.0 * (this.props.pitch - 0.5));
    source.playbackRate.value = rate;

    var panner = this.props.audioContext.createPanner();
    panner.panningModel = "equalpower";
    panner.setPosition(this.props.pan, 0, (1 - Math.abs(this.props.pan)));

    // Prevent clipping when panned.
    var gainNode = this.props.audioContext.createGain();
    gainNode.gain.value = (this.props.isMuted ? 0 : this.props.volume) * 0.8;

    source.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(this.props.audioContext.destination);

    source.start(time);
    // Prevent sample from being cut off when playback rate < 1.
    // Multiply by 2, since min playback rate = 0.5.
    source.stop(time + source.buffer.duration * 2);
  },

  render: function() {
    return (
      React.DOM.div({className: "channelPane"},
        SequencerBox({
          sequence: this.props.sequence,
          id: this.props.id,
          key: "sequencer" + this.props.id,
          propName: "sequence"
        }),
        React.DOM.div({className: "row"},
          ChannelSelectBox({
            samplePaths: this.props.samplePaths,
            samplePath: this.props.samplePath,
            id: this.props.id,
            key: "select" + this.props.id,
            propName: "buffer"
          }),
          ChannelSliderBox({
            value: this.props.volume,
            min: 0,
            max: 1,
            id: this.props.id,
            key: "volume" + this.props.id,
            propName: "volume"
          }),
          ChannelSliderBox({
            value: this.props.pitch,
            min: 0,
            max: 1,
            id: this.props.id,
            key: "pitch" + this.props.id,
            propName: "pitch"
          }),
          ChannelSliderBox({
            value: this.props.pan,
            min: -1,
            max: 1,
            id: this.props.id,
            key: "pan" + this.props.id,
            propName: "pan"
          }),
          MuteButtonBox({
            isMuted: this.props.isMuted,
            id: this.props.id,
            key: "mute" + this.props.id,
            propName: "isMuted"
          }),
          DeleteButtonBox({
            id: this.props.id,
            key: "delete" + this.props.id
          })
        )
      )
    );
  }

});

var DeleteButtonBox = React.createClass({

  onButtonClick: function() {
    var updateEvent = new CustomEvent("channel:delete", {
      detail: {
        id: this.props.id
      },
      bubbles: true
    });

    this.refs[this.props.key].getDOMNode().dispatchEvent(updateEvent);
  },

  render: function() {
    return (
      React.DOM.div({className: "small-2 columns end", ref: this.props.key},
        React.DOM.button({
          className: "button radius expand delete",
          onClick: this.onButtonClick
        }, "delete")
      )
    );
  }

});

var MuteButtonBox = React.createClass({

  onButtonClick: function() {
    var isMuted = this.props.isMuted;
    var updateEvent = new CustomEvent("channel:update", {
      detail: {
        value: !isMuted,
        id: this.props.id,
        propName: this.props.propName
      },
      bubbles: true
    });

    this.refs[this.props.key].getDOMNode().dispatchEvent(updateEvent);
  },

  render: function() {
    return (
      React.DOM.div({className: "small-2 columns", ref: this.props.key},
        React.DOM.button({
          style: {background: (this.props.isMuted ? "#c60f13" : "#404040")},
          className: "button radius expand",
          onClick: this.onButtonClick
        }, (this.props.isMuted ? "unmute" : "mute"))
      )
    );
  }

});

var ChannelSliderBox = React.createClass({

  onSliderChange: function(event) {
    var updateEvent = new CustomEvent("channel:update", {
      detail: {
        value: event.target.value,
        id: this.props.id,
        propName: this.props.propName
      },
      bubbles: true
    });

    this.refs[this.props.key].getDOMNode().dispatchEvent(updateEvent);
  },

  render: function() {
    return (
      React.DOM.div({className: "small-2 columns", ref: this.props.key},
        React.DOM.label({htmlFor: this.props.key}, this.props.propName),
        React.DOM.input({
          id: this.props.key,
          type: "range",
          value: this.props.value,
          min: this.props.min,
          max: this.props.max,
          step: "0.1",
          onChange: this.onSliderChange
        })
      )
    );
  }

});

var ChannelSelectBox = React.createClass({

  // Dumb hack to force the initial buffer load.
  componentDidMount: function() {
    var updateEvent = new CustomEvent("channel:updateBuffer", {
      detail: {
        samplePath: this.props.samplePath,
        id: this.props.id,
        propName: this.props.propName
      },
      bubbles: true
    });

    this.refs[this.props.key].getDOMNode().dispatchEvent(updateEvent);
  },

  onSelectChange: function(event) {
    var updateEvent = new CustomEvent("channel:updateBuffer", {
      detail: {
        samplePath: event.target.value,
        id: this.props.id,
        propName: this.props.propName
      },
      bubbles: true
    });

    this.refs[this.props.key].getDOMNode().dispatchEvent(updateEvent);
  },

  render: function() {
    var optionNodes = this.props.samplePaths.map(function(path, i) {
      // The name of the sample follows 'static/samples/'.
      var sampleName = path.substr(15);
      return React.DOM.option({key: "option" + i, value: path}, sampleName);
    });

    return (
      React.DOM.div({className: "small-4 columns", ref: this.props.key},
        React.DOM.select({
          ref: "sampleSelect" + this.props.id,
          value: this.props.samplePath,
          onChange: this.onSelectChange
        }, optionNodes)
      )
    );
  }

});

var SequencerBox = React.createClass({

  onStepClick: function(stepIndex) {
    var sequence = this.props.sequence.slice(0);
    sequence[stepIndex] = (sequence[stepIndex] ? 0 : 1);

    var updateEvent = new CustomEvent("channel:update", {
      detail: {
        value: sequence,
        id: this.props.id,
        propName: this.props.propName
      },
      bubbles: true
    });

    this.refs[this.props.key].getDOMNode().dispatchEvent(updateEvent);
  },

  render: function() {
    var stepNodes = this.props.sequence.map(function(note, i) {
      return React.DOM.li({key: "step" + i},
        React.DOM.button({
          type: "button",
          className: "button radius expand",
          style: {background: (note === 1 ? "#e6e6e6"
            : (i >= 0 && i <= 3 || i >= 8 && i <= 11 ? "#404040" : "#4b3535"))},
          onClick: this.onStepClick.bind(null, i)
        }));
    }.bind(this));

    return (
      React.DOM.div({ref: this.props.key},
        React.DOM.ul({className: "small-block-grid-8 large-block-grid-16"},
          stepNodes
        )
      )
    );
  }

});

React.renderComponent(App(null), document.body);
