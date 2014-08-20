
## Note

These days there is now [ShareJS](http://sharejs.org/). You should probably use that instead.

Nowpad is no longer maintained and the [now](https://www.npmjs.org/package/now) dependency that nowpad depends on no longer works. Theoritically, the `now` dependency could be swapped out for [primus](https://www.npmjs.org/package/primus), which should take about half a day, but that is not guaranteed to work.


<!-- TITLE/ -->

# NowPad: Realtime Text Collaboration

<!-- /TITLE -->


<!-- BADGES/ -->

[![Build Status](http://img.shields.io/travis-ci/balupton/nowpad.png?branch=master)](http://travis-ci.org/balupton/nowpad "Check this project's build status on TravisCI")
[![NPM version](http://badge.fury.io/js/nowpad.png)](https://npmjs.org/package/nowpad "View this project on NPM")
[![Dependency Status](https://david-dm.org/balupton/nowpad.png?theme=shields.io)](https://david-dm.org/balupton/nowpad)
[![Development Dependency Status](https://david-dm.org/balupton/nowpad/dev-status.png?theme=shields.io)](https://david-dm.org/balupton/nowpad#info=devDependencies)<br/>
[![Gittip donate button](http://img.shields.io/gittip/balupton.png)](https://www.gittip.com/balupton/ "Donate weekly to this project using Gittip")
[![Flattr donate button](http://img.shields.io/flattr/donate.png?color=yellow)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](http://img.shields.io/paypal/donate.png?color=yellow)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](http://img.shields.io/bitcoin/donate.png?color=yellow)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](http://img.shields.io/wishlist/browse.png?color=yellow)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

NowPad adds realtime text collaboration to parts of your website such as textareas, allowing multiple people to work on the same document at the same time (while seeing each others changes as they are applied). The benefit of this over traditional collaborative editing is two people would be editing the same document, they've both made changes, one person saves, and the other has to make the choice 'lose my changes, or lose his changes'. Nowpad keeps and applies both your changes as they happen.

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

## Install

### [NPM](http://npmjs.org/)
- Use: `require('nowpad')`
- Install: `npm install --save nowpad`

<!-- /INSTALL -->


## It Uses

* [Node.js](http://nodejs.org) - Server Side Javascript
* [Express.js](http://expressjs.com/) - The "Server" in Server Side Javascript
* [Now.js](http://nowjs.com/) - Server and Client Side Communication
* [CoffeeScript](http://jashkenas.github.com/coffee-script/) - JavaScript Made Easy
* [Buildr](https://github.com/balupton/buildr.npm) - (Java|Coffee)Script Bundling Made Easy


## Demo


1. Clone and setup this repo

		git clone https://github.com/balupton/nowpad.git nowpad
		cd nowpad
		npm install
		npm link

2. Start the demo app

		nowpad  # or npm start if inside nowpad directory


## Implementing

### Server Side

``` javascript
// Include NowPad
var nowpad = require('nowpad')

// Setup with your Express Server
var myNowpad = nowpad.createInstance({server: yourExpressServer})

	//Create known documents
myNowpad.addDocument('doc1', 'this is doc1')
myNowpad.addDocument('doc2', 'this is doc2')

// Handle unknown document
// Fires when an unknown document is requested
myNowpad.requestDocument(function(documentId, callback){
	// nowpad.addDocument(documentId)
	// callback(true)
	callback false
})

// Handle sync request
// Fires when a change is synced to the document
myNowpad.bind('sync', function(document, value){

})

// Handle disconnect request
// Fires when all the clients have disconnected from a document
myNowpad.bind('disconnected', function(document, value){

})
```

### Client Side

1. Include Dependencies

	``` html
	<script src="/nowjs/now.js"></script>
	<script src="/nowpad/nowpad.js"></script>
	```

2. Using NowPad with a Textarea

	``` javascript
	// Without jQuery
	window.nowpad.createInstance({
		element: document.getElementById('myTextarea'),
		documentId: 'doc1'
	});

	// Or With jQuery
	$textarea = $('#myTextarea').nowpad('doc1');
	```

3. Using NowPad with ACE

	``` javascript
	window.nowpad.createInstance({
		element: ace.edit('pad'),
		documentId: 'doc1'
	});
	```


## Learning

- [Roadmap](https://github.com/balupton/nowpad/wiki/Roadmap)
- [How it works](https://github.com/balupton/nowpad/blob/master/DEV.md)


<!-- HISTORY/ -->

## History
[Discover the change history by heading on over to the `HISTORY.md` file.](https://github.com/balupton/nowpad/blob/master/HISTORY.md#files)

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

## Contribute

[Discover how you can contribute by heading on over to the `CONTRIBUTING.md` file.](https://github.com/balupton/nowpad/blob/master/CONTRIBUTING.md#files)

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

## Backers

### Maintainers

These amazing people are maintaining this project:

- Benjamin Lupton <b@lupton.cc> (https://github.com/balupton)

### Sponsors

No sponsors yet! Will you be the first?

[![Gittip donate button](http://img.shields.io/gittip/balupton.png)](https://www.gittip.com/balupton/ "Donate weekly to this project using Gittip")
[![Flattr donate button](http://img.shields.io/flattr/donate.png?color=yellow)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](http://img.shields.io/paypal/donate.png?color=yellow)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](http://img.shields.io/bitcoin/donate.png?color=yellow)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](http://img.shields.io/wishlist/browse.png?color=yellow)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

### Contributors

These amazing people have contributed code to this project:

- [Benjamin Lupton](https://github.com/balupton) <b@lupton.cc> — [view contributions](https://github.com/balupton/nowpad/commits?author=balupton)

[Become a contributor!](https://github.com/balupton/nowpad/blob/master/CONTRIBUTING.md#files)

<!-- /BACKERS -->


<!-- LICENSE/ -->

## License

Licensed under 

Copyright &copy; 2011+ Benjamin Lupton <b@lupton.cc> (https://github.com/balupton)

<!-- /LICENSE -->


