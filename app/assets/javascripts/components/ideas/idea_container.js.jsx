var RelatedIdeas = require('./related_ideas.js.jsx');

var IdeaContainer = React.createClass({
  propTypes: {
    showRelatedIdeas: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      showRelatedIdeas: true
    }
  },

  render() {
    var showRelatedIdeas = this.props.showRelatedIdeas;
    var leftColumnClasses = React.addons.classSet({
      col: showRelatedIdeas,
      'col-8': true,
      'mx-auto': !showRelatedIdeas,
      'px2': true
    });

    var rightColumnClasses = React.addons.classSet({
      'display-none': !showRelatedIdeas,
      'col': showRelatedIdeas,
      'col-4': showRelatedIdeas,
      'px2': showRelatedIdeas
    });

    return (
      <div className="container">
        <div className="clearfix mxn2 py3">
          <div className={leftColumnClasses}>
            <h4 className="mt2 mb2">
              <a href="/ideas" className="bold">
                &#8592; All product ideas
              </a>
            </h4>
          </div>

          <div className={rightColumnClasses}>
            <h5 className="mt2 mb2">Other product ideas</h5>
          </div>
        </div>

        <div className="clearfix mxn2">
          <div className={leftColumnClasses}>
            <div className="idea-item bg-white rounded shadow">
              {this.props.children}
            </div>
          </div>

          <div className={rightColumnClasses}>
            <RelatedIdeas />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = IdeaContainer;
