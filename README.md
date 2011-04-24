# NowPad: Realtime Text Collaboration

## Uses

* [Node.js](http://nodejs.org) - Server Side Javascript
* [Express.js](http://expressjs.com/) - The "Server" in Server Side Javascript
* [Now.js](http://nowjs.com/) - Server and Client Side Communication

## Get Started

	git clone git://github.com/balupton/nowpad.git
	cd nowpad
	npm install
	node server.js # http://localhost:9572/

## Features

* Sync the same textarea between multiple clients
* Keep the cursor positions intact
* Only the difference is sent between clients

## Todo

* Ensure it works with multiple people typing at the same time
* Add support for multiple documents/textareas

## History

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
