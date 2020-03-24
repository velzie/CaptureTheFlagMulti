var express = require('express');
var app = express();
var playersonline = [];
var all = [];
var width = 1400;
var height = 700;
var serv = require('http').Server(app);
app.get('/',(req,res) => res.sendFile(__dirname + '/client/index.html'));
app.use('/client',express.static(__dirname + '/client'));
serv.listen(process.env.PORT || 5000);
var flags = [{x:20,y:350},{x:1360,y:350}];
var score = [0,0];
var io = require('socket.io')(serv,{});
io.sockets.on('connection',(socket)=>{
console.log("*Player 42B has entered the chat");
// players have connected. Yay! I'm popular now.
socket.id = Math.random();
var team = Math.floor(Math.random());
var balance = 0;
if (all != []){
  for (var p of all) {
    if (p.team == 0){
      balance --;
    }else{
      balance ++;
    }
    if (balance > 0){
      team = 0;
    }else if (balance < 0) {
      team = 1;
    }
  }
}
socket.you = {x:1000 * team + 200,y:350,team:team};
socket.on('disconnect',(socket)=>{
console.log("*Player 42B has left the chat");
// WHY DID THEY HAVE TO LEAVE I'M PERFECT!!!!!!!
});
socket.on('packet',(packet) =>{
// ooh information! Shiny!
var you = socket.you;

if (packet.keys[87]){
if (you.y > 0){
you.y -= 2;
}
}
if (packet.keys[65]){
if (you.x > 0){
if (you.x > 150 || you.team == 1){
you.x -= 2;
}
}
}
if (packet.keys[83]){
if (you.y < height - 20){
you.y += 2;
}
}
if (packet.keys[68]){
  if (you.x < width - 20){
  if (you.x < width - 170 || you.team == 0){
you.x += 2;
}
}
}
// processing
if (you.team == 0){
if (collideRectRect(flags[1].x,flags[1].y,20,20,you.x,you.y,20,20)){
flags[1].x = you.x;
flags[1].y = you.y;
if (you.x < 700){
console.log("hello");
flags[1].x = 1360;
flags[1].y = 350;
score[0] ++;
}
}
}else{
if (collideRectRect(flags[0].x,flags[0].y,20,20,you.x,you.y,20,20)){
  flags[0].x = you.x;
  flags[0].y = you.y;
  if (you.x > 700){
  flags[0].x = 20;
  flags[0].y = 350;
  score[1] ++;
  }
}
}
for (var player of all) {
  if (collideRectRect(player.x,player.y,20,20,you.x,you.y,20,20)){
    if (you.team == 1 && player.team == 0){
      you.x = 1200;
      you.y = 350;
    }else if (you.team == 0 && player.team == 1){
      you.x = 200;
      you.y = 350;
    }
  }
}

// send drawing instructions
all = [];
var clients = io.sockets.clients().connected;
for (var c in clients) {
if (clients[c].connected){
all.push(clients[c].you);
}
}
socket.emit('drawdata',[score,flags,all]);
})
});
function collideRectRect(x, y, w, h, x2, y2, w2, h2) {
  if (x + w >= x2 &&
      x <= x2 + w2 &&
      y + h >= y2 &&
      y <= y2 + h2) {
        return true;
  }
  return false;
};
