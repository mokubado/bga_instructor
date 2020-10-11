# bga_instructor

This module is the implementation of the tutorial UI for [BGA Illustori](https://boardgamearena.com/gamepanel?id=1246&howtoplay_seemore).

## How to use

- Add Instructor.js to the game's "modules" folder.
- On JS file of the game, import this module.
```javascript
define([
  ...
  g_gamethemeurl + "modules/Instructor.js"
  ...
], function(dojo, declare, sniff) {
...
```
- Allocate Instructor instance on setup funciton.
```javascript
setup: function(gamedatas) {
...
this.inst = new Instructor(this, dojo);  //Arguments are the game and dojo instance.
...
```
- Add instructions.
```javascript
this.inst.showInstruction(
'firstPlayerTurn', //Keyword of this tutorial message.
[{
  target: $('table_card'), //A DOM that you want to show message.
  message: instText        //The tutorial text.
}]);
```
- On the server side's getAllDatas function, you should add 'beginner' column in every player's record.
```PHP
function getAllDatas()
{
  $result = [];
  $players = self::getCollectionFromDb($sql);
  $resultPlayers = [];
  ...
  foreach ($players as $playerID => $player) {
    $player['beginner'] = bool_beginner_or_not;
  }
  $result['players'] = $resultPlayers;
  return $result;
},
```
