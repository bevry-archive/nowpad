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
* Data will always remain intact between clients (it will never get corrupted)
* Potential to work with HTML as well as Text

## Todo

[The roadmap lays here](https://github.com/balupton/nowpad/wiki/Roadmap)

## History

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
