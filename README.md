# NowPad: Realtime Text Collaboration

## Uses

* [Node.js](http://nodejs.org) - Server Side Javascript
* [Express.js](http://expressjs.com/) - The "Server" in Server Side Javascript
* [Now.js](http://nowjs.com/) - Server and Client Side Communication

## Get Started

	git clone git://github.com/balupton/nowpad.git
	cd nowpad
	npm install
	node app.js # http://localhost:8080/

## Features

* Sync the same textarea between two different clients
* Keep the cursor positions intact
* Only the difference is sent between clients

## Todo

* Server should keep a copy of the document to send to new clients
* Ensure it works with multiple people typing at the same time

## History

- v0.2
	- Working on a type together basis with two people

- v0.1
	- Working on a start and stop basis

## License

Licensed under the [MIT License](http://creativecommons.org/licenses/MIT/)
Copyright 2011 [Benjamin Arthur Lupton](http://balupton.com)
