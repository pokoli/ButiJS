#ButiJS

ButiJS is a server-client application for the Catalan cards game: Butifarra

The server code is based on the node.js asynchronous asynchronous event-driven model.
 

##Server API

The server will respond to the following events

### login

Used to identify the user with a name on the server. 

Expects the player's name. 

Returns the player's assigned name

### create-game

Create a new game. The creator of the game will automaticaly join the game.

Expects the new game. 

Returns the created game. 

### join-game

Make the current player join the game. 

If the player is currently on a game should throw an error. 

### list-games

Returns the current game's on the server

### list-players

Returns the current game's on the server

### send

Sends messages to all the players connected on the server (public chat)

Expects a string message.

### Butifarra's specific events

The following events are specific to the Butifirra game. 

#### made-thriumph

Make thriumph on the active game. 

#### new-roll

Roll a new card on the active game.

#### do-contro

Fired when the player wants to make a contro.


##Client API

The client is supposed to recibe the following events. 


### welcome

Returns the server welcome message

### mesage

Returns a message sent by the server

### updated-game

Fired when the info of the game has been updated. 

### start

A game (which the player plays) is started. All the game data is on the first parameter

### Butifarra's specific events

The following events are specific to the Butifirra game. 

#### make-thriumph

Fired when the player has to make thriumph on the current round.

#### thriumph

Returns the choiced thriumph of the current round. 


#### play-card

Fired when the player has to select a card to move

#### played-card

Fired when a card has been played. Data contains the played card and the player who played it.

#### new-move

Fired when the move (4 played cards) is ended. 

#### end-move

Fired when the move (4 played cards) is ended. 

#### contro

Fired when the player has the posibilty of make a contro.

#### contro-done

Fired when the another player has countred the game.



##License

The MIT License (MIT)

Copyright (C) 2011 by Sergi Almacellas <pokoli@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
