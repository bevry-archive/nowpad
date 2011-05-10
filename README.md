# NowPad: Realtime Text Collaboration

NowPad adds realtime text collaboration to parts of your website such as textareas, allowing multiple people to work on the same document at the same time (while seeing each others changes as they are applied). The benefit of this over traditional collaborative editing is two people would be editing the same document, they've both made changes, one person saves, and the other has to make the choice "lose my changes, or lose his changes". Nowpad keeps and applies both your changes as they happen.


## It Uses

* [Node.js](http://nodejs.org) - Server Side Javascript
* [Express.js](http://expressjs.com/) - The "Server" in Server Side Javascript
* [Now.js](http://nowjs.com/) - Server and Client Side Communication


## Trying

[You can try it right now online with no installation right here](http://nowpad.nodester.com)


## Installing


1. [Install Node.js](https://github.com/balupton/node/wiki/Installing-Node.js)

2. Install NowPad

		npm -g install nowpad


## Running Installed Demos

- Basic single textarea demo

		nowpad basic # http://localhost:9572/

- [ACE Code Editor](http://ace.ajax.org/) demo

		nowpad ace # http://localhost:9572/


## Implementing

- Server Side

		// Include
		nowpad = require("nowpad");

		// Setup with your Express Server
		nowpad.setup(app);

		// Bind to Document Changes
		nowpad.bind('sync',function(value){});

- Client Side

	- Include Dependencies

			<script src="/nowjs/now.js"></script>
			<script src="/nowpad/nowpad.js"></script>

	- Using NowPad with a Textarea

			// Without jQuery
			new nowpadClient({
				pad: document.getElementById('myTextarea')
			});

			// Or With jQuery
			$textarea = $('#myTextarea').nowpad();

	- Using NowPad with ACE

			new nowpadClient({
				pad: ace.edit('pad')
			});


## Learning

[You can find the roadmap here](https://github.com/balupton/nowpad/wiki/Roadmap)


## History

- v0.8 April 29, 2011
	- Nowpad now works with ACE and TextAreas

- v0.7 April 29, 2011
	- Nowpad is now a npm package

- v0.6
	- Greatly improved performance

- v0.5
	- Ignores internet explorer and console less browsers
	- Now will only apply syncs once the user has finished typing

- v0.4
	- New algorithm which ensures data will never get corrupted

- v0.3
	- Server now keeps a copy of the document

- v0.2
	- Working on a type together basis with two people

- v0.1
	- Working on a start and stop basis


## License

Licensed under the [MIT License](http://creativecommons.org/licenses/MIT/)
Copyright 2011 [Benjamin Arthur Lupton](http://balupton.com)
