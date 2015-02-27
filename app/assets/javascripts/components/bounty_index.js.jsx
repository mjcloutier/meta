var Accordion = require('./accordion.js.jsx')
var BountiesStore = require('../stores/bounties_store.js')
var BountyActionCreators = require('../actions/bounty_action_creators.js')
var BountyFilter = require('./bounty_filter.js.jsx')
var BountyList = require('./bounty_list.js.jsx')
var Button = require('./ui/button.js.jsx')
var Callout = require('./callout.js.jsx')
var PaginationLinks = require('./pagination_links.js.jsx')
var Spinner = require('./spinner.js.jsx')
var UserStore = require('../stores/user_store.js')

var BountyIndex = React.createClass({
  propTypes: {
    tags: React.PropTypes.array,
    assets: React.PropTypes.array,
    pages: React.PropTypes.number,
    product: React.PropTypes.object,
    valuation: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      value: 'is:open ',
      sort: 'priority',
      user: null
    }
  },

  componentDidMount: function() {
    UserStore.addChangeListener(this.getStateFromStore)

    this.getStateFromStore();

    window.addEventListener('scroll', this.onScroll);
  },

  componentWillUnmount: function() {
    window.removeEventListener('scroll', this.onScroll);
    UserStore.removeChangeListener(this.getStateFromStore)
  },

  onScroll: function() {
    var atBottom = $(window).scrollTop() + $(window).height() > $(document).height() - 200

    if (atBottom) {
      BountyActionCreators.requestNextPage(
        this.props.product.slug,
        this.params(this.state.value, this.state.sort)
      )
    }
  },

  getBounties: function(value, sort, page) {
    BountyActionCreators.requestBountiesDebounced(
      this.props.product.slug,
      this.params(value, sort, page)
    )
  },

  handleValueChange: function(event) {
    var value = event.target.value

    this.setState({ value: value })

    this.getBounties(value, this.state.sort, 1)
  },

  handleSortChange: function(event) {
    var sort = event.target.value

    this.setState({ sort: sort })

    this.getBounties(this.state.value, sort, 1)
  },

  handlePageChange: function(page) {
    this.getBounties(this.state.value, this.state.sort, page)
  },

  addTag: function(tag) {
    return function(event) {
      event.preventDefault()

      var value = this.state.value + ' ' + 'tag:' + tag
      this.setState({ value: value })

      this.getBounties(value, this.state.sort, 1)
    }.bind(this)
  },

  renderTags: function() {
    return this.props.tags.map(function(tag, i) {
      return (
        <li className="mb1 lh0_9" key={tag + '-' + i}>
          <a href="#" className="pill-hover block py1 px3" onClick={this.addTag(tag)}>
            <span className="fs1 fw-500 caps">#{tag}</span>
          </a>
        </li>
      )
    }.bind(this)).toJS();
  },

  renderAssets: function() {
    var assets = this.props.assets
    var product = this.props.product
    var assets_url = product.url+'/assets'

    return (
      <div className="clearfix">
        {assets.map(function(asset, i) {
          if (['jpg', 'png', 'gif'].indexOf(asset.attachment.extension) < 0) {
            return null
          }

          return (
            <div className="sm-col sm-col-6 px1 mb1" key={asset.name + '-' + i}>
              <a href={assets_url} title={asset.name} className="block bg-gray-4 bg-size-cover bg-repeat-none bg-position-center" style={{backgroundImage: 'url('+asset.thumbnail_url+')', height: '80px'}}></a>
            </div>
          )
        })}
      </div>
    )
  },

  render: function() {
    var bountyFilterProps = _.pick(this.props, 'tags', 'creators', 'workers')

    var product = this.props.product

    if (typeof product === "undefined" || product === null) {
      return null;
    }

    var callout = null

    if (this.state.user && !this.state.user.coin_callout_viewed_at) {
      callout = (
        <div className="row">
          <div className="col-xs-12">
            <Callout>
              <div className="overflow-hidden" style={{ padding: '1.5rem 2rem', height: '84px' }}>
                <strong>Coins determine your ownership of a product.</strong> You'll
                notice each bounty below is assigned a coin value.  Complete
                the bounty and you'll be awarded those coins which represent
                your ownership. <a href="/guides/platform#earning-coins">Learn more</a>
              </div>
            </Callout>
          </div>
        </div>
      )
    }

    return (
      <div>
        {callout}
        <div className="row">
          <div className="col-xs-12 col-sm-4 r768_float-right">
            <span className="col-sm-11 col-sm-push-1 p0">
              <div className="bg-white rounded shadow pt3 pr3 pb4 pl3 mb2" style={{paddingLeft: '1.75rem'}}>
                <div className="block h5 mt0 mb1 bold">
                  Getting Started with Bounties
                </div>
                <div className="h6 m0 gray-1">
                  A bounty is the community asking for help on {product.name}.
                  Find one that you would like to do and jump right in.
                  <br/><br/>
                  Ping <a href={product.people_url}>@core</a> in our chat room if you have any questions.
                </div>

                <div className="center mt2 border-top">
                  <div className="mt2">
                    <Button type="default" action={function() { window.open('chat', '_blank'); }}>
                      Jump into chat
                    </Button>
                  </div>
                </div>
              </div>
              <div className="col-xs-6 col-sm-12">
                <div className="pb1"> {/*Tags*/}
                  <Accordion title="Tags">
                    <ul className="list-reset mxn2">
                      {this.renderTags()}
                    </ul>
                  </Accordion>
                </div>
              </div>
              <div className="col-xs-6 col-sm-12">
                <div className="mb1"> {/*Assets*/}
                  <Accordion title="Assets" >
                    {this.renderAssets()}
                  </Accordion>
                </div>
              </div>
            </span>
          </div>
          <div className="col-xs-12 col-sm-8 r768_pr0">
            <BountyFilter {...bountyFilterProps}
                value={this.state.value}
                onValueChange={this.handleValueChange}
                sort={this.state.sort}
                onSortChange={this.handleSortChange} />
            <BountyList product={this.props.product}
                valuation={this.props.valuation}
                onPageChange={this.handlePageChange}
                draggable={this.draggable()} />
          </div>
        </div>
      </div>
    );
  },

  params: function(value, sort, page) {
    var terms = value.split(' ')

    var params = _.reduce(terms, function(memo, value) {
      var filter = value.split(':')

      if (filter.length == 2) {
        memo[filter[0]] = _.compact(_.flatten([memo[filter[0]], filter[1]]))
      } else {
        memo.query = _.compact([memo.query, value]).join(' ')
      }

      return memo
    }, {})

    var renames = { is: 'state', by: 'created' }

    params = _.reduce(params, function(result, value, key) {
      key = renames[key] || key
      result[key] = value
      return result
    }, {});

    params.sort = sort
    params.page = page

    return params
  },

  draggable: function() {
    if (!this.props.product.can_update) {
      return false
    }

    var params = this.params(this.state.value, this.state.sort)
    return params.sort == 'priority' && params.state == 'open'
  },

  getStateFromStore: function() {
    this.setState({
      user: UserStore.getUser()
    });
  }
});

module.exports = window.BountyIndex = BountyIndex;
