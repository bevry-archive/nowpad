# NowPad: Realtime Text Collaboration

NowPad adds realtime text collaboration to parts of your website such as textareas, allowing multiple people to work on the same document at the same time (while seeing each others changes as they are applied). The benefit of this over traditional collaborative editing is two people would be editing the same document, they've both made changes, one person saves, and the other has to make the choice "lose my changes, or lose his changes". Nowpad keeps and applies both your changes as they happen.


## It Uses

* [Node.js](http://nodejs.org) - Server Side Javascript
* [Express.js](http://expressjs.com/) - The "Server" in Server Side Javascript
* [Now.js](http://nowjs.com/) - Server and Client Side Communication
* [CoffeeScript](http://jashkenas.github.com/coffee-script/) - JavaScript Made Easy
* [Buildr](https://github.com/balupton/buildr.npm) - (Java|Coffee)Script Bundling Made Easy


## Trying

[You can try it right now online with no installation right here](http://nowpad.nodester.com)


## Installing


1. [Install Node.js](https://github.com/balupton/node/wiki/Installing-Node.js)

2. Install [CoffeeScript](http://jashkenas.github.com/coffee-script/)
		
		npm install -g coffee-script

3. Install NowPad

		npm install -g nowpad


## Running Installed Demos

- The default demo

		nowpad # http://localhost:9572/

- [ACE Code Editor](http://ace.ajax.org/) demo

		nowpad ace # http://localhost:9572/

- If for some reason the nowpad command doesn't work, use the following instead:

		git clone git://github.com/balupton/nowpad.git
		cd nowpad
		coffee bin/nowpad.coffee # http://localhost:9572/


## Implementing

- Server Side

	``` coffeescript
	# Include NowPad
	nowpad = require 'nowpad'

	# Setup with your Express Server
	myNowpad = nowpad.createInstance server: yourExpressServer

	# Create known documents
	myNowpad.addDocument 'doc1', 'this is doc1'
	myNowpad.addDocument 'doc2', 'this is doc2'

	# Handle unknown document
	# Fires when an unknown document is requested
	myNowpad.requestDocument (documentId, callback) ->
		# nowpad.addDocument documentId
		# callback true
		callback false

	# Handle sync request
	# Fires when a change is synced to the document
	myNowpad.bind 'sync', (document, value) ->

	# Handle disconnect request
	# Fires when all the clients have disconnected from a document
	myNowpad.bind 'disconnected', (document, value) ->
	```

- Client Side

	- Include Dependencies
		
		``` html
		<script src="/nowjs/now.js"></script>
		<script src="/nowpad/nowpad.js"></script>
		```

	- Using NowPad with a Textarea

		``` javascript
		// Without jQuery
		window.nowpad.createInstance({
			element: document.getElementById('myTextarea'),
			documentId: 'doc1'
		});

		// Or With jQuery
		$textarea = $('#myTextarea').nowpad('doc1');
		```

	- Using NowPad with ACE
		
		``` javascript
		window.nowpad.createInstance({
			element: ace.edit('pad'),
			documentId: 'doc1'
		});
		```


## Learning

- [Roadmap](https://github.com/balupton/nowpad/wiki/Roadmap)
- [How it works](https://github.com/balupton/nowpad/blob/master/DEV.md)


## History

- v0.12 July 28, 2011
	- Fixed out of date packages issue
	- Fixed basic demo
	- Fixed focus issue with multiple pads for the same document
	- Made ace demo the default
	- Fixed native textarea elements delay - they had change instead of keyup

- v0.11 May 20, 2011
	- Now supports multiple instances of nowpad for multi server configurations

- v0.10 May 18, 2011
	- Added `nowpad.addDocument(documentId,value)` and `nowpad.delDocument(documentId)` and `nowpad.requestDocument(requestHandler(documentId,next(added)))` for extra security
	- Namespaced now events and callbacks
	- And other fixes

- v0.9 May 15, 2011
	- Rewrote in CoffeeScript
	- Added support for multiple pads, and mutliple documents

- v0.8 April 29, 2011
	- Nowpad now works with ACE and TextAreas

- v0.7 April 29, 2011
	- Nowpad is now a npm package

- v0.6 April 26, 2011
	- Greatly improved performance

- v0.5 April 26, 2011
	- Ignores internet explorer and console less browsers
	- Now will only apply syncs once the user has finished typing

- v0.4 April 25, 2011
	- New algorithm which ensures data will never get corrupted

- v0.3 April 24, 2011
	- Server now keeps a copy of the document

- v0.2 April 24, 2011
	- Working on a type together basis with two people

- v0.1 April 24, 2011
	- Working on a start and stop basis


## License

Licensed under the [MIT License](http://creativecommons.org/licenses/MIT/)
Copyright 2011 [Benjamin Arthur Lupton](http://balupton.com)
