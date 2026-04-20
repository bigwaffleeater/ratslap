# RATSLAP! 

Play the live demo at [ratslap.vercel.app](https://ratslap.vercel.app/)!

This project is a full-stack implementation of the game Egyptian Ratscrew/Ratslap, programmed in Typescript, and utilizing React, Node.js, and Socket.io. Ratslap is deployed on Vercel (frontend) and Railway (backend).

## Rules of Ratslap

Egyptian Ratscrew is a card game in which a standard 52 card deck is split amongst all participants. The participants can not see what cards they have in their deck and have them upside down. In every turn, every player must place a card right side up in the playing deck. There is a mechanic called "slapping" in Egyptian Ratscrew, where if there is a valid combination within the playing deck, participants of the game can slap the deck to win the playing deck and have the playing deck in their personal deck. If the slap is invalid (it doesn't follow any of the rules below), then the participant removes a card from their personal deck and places it at the bottom of the playing deck. Cards are consistently and quickly dealt, so the game is extremely fast paced! You may notice that the deck can be slappable before someone places a card quickly, so reaction time is useful for this game. 

Here are the valid ways a participant can win a deck: 

### Top-Bottom 

If the top and bottom card of the playing deck are the same card, the pile is slappable and participants can win the entire deck. 

### Marriage 

If the card on top of the playing deck is a queen/king and the next card played is the opposite, then the playing deck is slappable. 

### Double 

If the card on top of the playing deck is the same as the next card played, then the playing deck is slappable. 

### Sandwich

If the card second from the top is the same as the next card played, then the playing deck is slappable. 

## Implementation: 

This implementation of Egyptian Ratscrew does not use jokers. 

