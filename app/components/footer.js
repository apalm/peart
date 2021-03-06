var React = require('react');

var Footer = React.createClass({
  render: function() {
    return (
      React.DOM.footer(null,
        React.DOM.div({className: 'Footer-credits'},
          React.DOM.span({key: 'credit0'},
            'Made by ', React.DOM.a({href: '//github.com/apalm'}, 'apalm'), '.'),
          React.DOM.span({key: 'credit1'},
            'View project source on ',
              React.DOM.a({href: '//github.com/apalm/peart'}, 'GitHub'), '.'
          )
        )
      )
    );
  }
});

module.exports = Footer;
