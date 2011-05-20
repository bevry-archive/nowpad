# NowPad: Realtime Text Collaboration

NowPad adds realtime text collaboration to parts of your website such as textareas, allowing multiple people to work on the same document at the same time (while seeing each others changes as they are applied). The benefit of this over traditional collaborative editing is two people would be editing the same document, they've both made changes, one person saves, and the other has to make the choice "lose my changes, or lose his changes". Nowpad keeps and applies both your changes as they happen.


## It Uses

* [Node.js](http://nodejs.org) - Server Side Javascript
* [Express.js](http://expressjs.com/) - The "Server" in Server Side Javascript
* [Now.js](http://nowjs.com/) - Server and Client Side Communication
* [CoffeeScript](http://jashkenas.github.com/coffee-script/) - JavaScript Made Easy


## Trying

[You can try it right now online with no installation right here](http://nowpad.nodester.com)


## Installing


1. [Install Node.js](https://github.com/balupton/node/wiki/Installing-Node.js)

2. Install CoffeeScript
		
		npm -g install coffee-script

3. Install NowPad

		npm -g install nowpad


## Running Installed Demos

- Basic single textarea demo

		nowpad basic # http://localhost:9572/

- [ACE Code Editor](http://ace.ajax.org/) demo

		nowpad ace # http://localhost:9572/


## Implementing

- Server Side
	
	``` javascript
	// Include NowPad
	require('coffee-script')
	nowpad = require('nowpad');

	// Setup with your Express Server
	myNowpad = nowpad.createInstance({
		server: app // where app is your express server
	});

	// Bind to Document Changes
	myNowpad.bind('sync',function(value){});
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

[You can find the roadmap here](https://github.com/balupton/nowpad/wiki/Roadmap)


## Known Issues

- None!


## History

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
