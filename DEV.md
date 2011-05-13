# Contributors Guide


## What entities do I need to know?

 - Clients

	A client refers to a connection to the server, each browser tab gets a new connection, and is thus a new client
	A client may have multiple pads

- Pads
	A pad is an editable area on the webpage which relates to a document
	The server does not care about pads, it only cares about documents

- Documents
	A document is a bunch of text that is synced between pads (and clients)


## How does NowPad work?

- Connection
	1. A connection is made between the client and the server
	2. The client creates a new pad, and sends off a sync request for the pad's document to the server
	3. The server checks to see if it knows about the document, if it doesn't it creates
	4. The server handles the request and sends the latest to the client

- Syncing to the Server
	1. When a change is made to a document it is synced with the server from the client which made the change
	2. The server upon receipt will check to see if the client has any updates to be applied
	3. If so it will queue the updates for the client
	4. After the queing it will then apply the clients patch to the server's copy and update the state count
	5. It will then send the list of updates to the client to synchronise it with the latest copy
	6. It will then notifiy all clients that a change has been made

- Syncing from the Server
	1. When a change is made to a document it is synced with the server, and then all the clients are notified of the change
	2. the client upon receipt will check the state against its state, and if it is up to date then it is ignored
	3. If it is not up to date, the client will wait until the user has stopped typing for `nowpad.delay` milliseconds and once stopped it will perform a synchronisation request which:
		1. Obtains a lock on the document with the server
		2. Computes the differences from the last synced state to the current state to get the new user changes
		3. Apply the new synced changes from the server to the last synced state on the client
		4. Apply the new user differences to the pad
		5. If there were new user differences, queue a sync event
		6. Release the lock on the document with the server