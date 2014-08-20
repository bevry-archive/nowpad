# History

## Unreleased August 21, 2014
- Updated files for latest deps
- Broken as `now` dependency no longer works

## v0.12 July 28, 2011
- Fixed out of date packages issue
- Fixed basic demo
- Fixed focus issue with multiple pads for the same document
- Made ace demo the default
- Fixed native textarea elements delay - they had change instead of keyup

## v0.11 May 20, 2011
- Now supports multiple instances of nowpad for multi server configurations

## v0.10 May 18, 2011
- Added `nowpad.addDocument(documentId,value)` and `nowpad.delDocument(documentId)` and `nowpad.requestDocument(requestHandler(documentId,next(added)))` for extra security
- Namespaced now events and callbacks
- And other fixes

## v0.9 May 15, 2011
- Rewrote in CoffeeScript
- Added support for multiple pads, and mutliple documents

## v0.8 April 29, 2011
- Nowpad now works with ACE and TextAreas

## v0.7 April 29, 2011
- Nowpad is now a npm package

## v0.6 April 26, 2011
- Greatly improved performance

## v0.5 April 26, 2011
- Ignores internet explorer and console less browsers
- Now will only apply syncs once the user has finished typing

## v0.4 April 25, 2011
- New algorithm which ensures data will never get corrupted

## v0.3 April 24, 2011
- Server now keeps a copy of the document

## v0.2 April 24, 2011
- Working on a type together basis with two people

## v0.1 April 24, 2011
- Working on a start and stop basis
