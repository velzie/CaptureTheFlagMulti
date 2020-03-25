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
var powerups = [];
var io = require('socket.io')(serv,{});
setInterval(()=> {
  //
powerups.push(new PowerUp(Math.floor(Math.random() * 3)));
},10000);
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
socket.you = {x:1000 * team + 200,y:350,team:team,speed:4,forcefield:false,laser:false,dir:[0,0]};
socket.on('disconnect',(socket)=>{
console.log("*Player 42B has left the chat");
// WHY DID THEY HAVE TO LEAVE I'M PERFECT!!!!!!!
});
socket.on('packet',(packet) =>{
// ooh information! Shiny!
var you = socket.you;

if (packet.keys[87]){
if (you.y > 0){
you.dir = [0,-1];
you.y -= you.speed;
}
}
if (packet.keys[65]){
if (you.x > 0){
if (you.x > 100 || you.team == 1){
you.dir = [-1,0];
you.x -= you.speed;
}
}
}
if (packet.keys[83]){
if (you.y < height - 20){
you.dir = [0,1];
you.y += you.speed;
}
}
if (packet.keys[68]){
  if (you.x < width - 20){
  if (you.x < width - 100 || you.team == 0){
    you.dir = [1,0];
you.x += you.speed;

}
}
}
if (packet.keys[68] && packet.keys[83]){
you.dir = [1,1];
}
if (packet.keys[68] && packet.keys[87]){
you.dir = [1,-1];
}
if (packet.keys[65] && packet.keys[87]){
you.dir = [-1,-1];
}
if (packet.keys[65] && packet.keys[83]){
you.dir = [-1,1];
}
you.laser = packet.keys[32] && you.power == 2;
// processing
  for (var i = 0; i < powerups.length; i++) {
  let power = powerups[i];
  if (collideRectRect(power.x,power.y,20,20,you.x,you.y,20,20)){
  console.log("Touched");
  powerups.splice(i,1);
  switch (power.type) {
    case 0:
    you.speed += 4;
    setTimeout(()=>you.speed = 4,9000);
    break;
    case 1:
    you.forcefield = true;
    break;
    case 2:
    you.power = 2;
    setTimeout(()=>you.power = null,9000);
    break;
    default:
    console.log("something's not right...");
  }
  }
  }
if (you.team == 0){
if (collideRectRect(flags[1].x,flags[1].y,20,20,you.x,you.y,20,20)){
flags[1].x = you.x;
flags[1].y = you.y;
if (you.x < 700){
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
      if (you.x < 700){
      if (you.forcefield){
        you.forcefield = false;
        player.x = 200;
        player.y = 350;
      }else{
      if (collideRectRect(flags[0].x,flags[0].y,20,20,you.x,you.y,20,20)){
        flags[0].x = 20;
        flags[0].y = 350;
      }
      you.x = 1200;
      you.y = 350;
    }
    }else{
      if (player.forcefield){
        you.forcefield = false;
        you.x = 1200;
        you.y = 350;
      }else{
      player.x = 200;
      player.y = 350;
    }
    }
    }else if (you.team == 0 && player.team == 1){
      if (you.x > 700){
      if (you.forcefield){
        you.forcefield = false;
        player.x = 1200;
        player.y = 350;
    }else{
      if (collideRectRect(flags[1].x,flags[1].y,20,20,you.x,you.y,20,20)){
        flags[1].x = 1360;
        flags[1].y = 350;
      }
      you.x = 200;
      you.y = 350;

    }
    }else{
      if (player.forcefield){
        you.forcefield = false;
        you.x = 200;
        you.y = 350;
      }else{
      player.x = 1200;
      player.y = 350;
    }
    }
    }
  }
  // oh no what if a laser hits me
  if (
  collideLineRect(you.x,you.y,20,20,
  player.x + 10,player.y + 10,
  player.x + 1000 * player.dir[0] + 10,player.y + 1000 * player.dir[1] + 10)
  && player != you
  && player.team != you.team
  && player.laser
  ){
    console.log("aah a laser hit" + you.team);
    you.speed -= 0.6;
    setTimeout(()=> you.speed = 4,4000);
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
socket.emit('drawdata',[score,flags,all,powerups,socket.you]);
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
}
function collideLineLine(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}
function collideLineRect(x,y,w,h,a,b,c,d) {
   return collideLineLine(x,y,x,y + h,a,b,c,d) ||
          collideLineLine(x,y + h,x + w,y + h,a,b,c,d) ||
          collideLineLine(x + w,y,x + w,y + h,a,b,c,d) ||
          collideLineLine(x,y,x + w,y,a,b,c,d);
}
class PowerUp {
  constructor(type) {
    this.x = Math.floor(Math.random() * width);
    this.y = Math.floor(Math.random() * height);
    this.type = type;
    setTimeout(()=>powerups.splice(powerups.findIndex((elt) => elt == this),1),20000);
    // 0: speed boost
    // // // 1: gravity??? I would need a physics engine, but still...
    // // // 1. darkness? possibly
    //1. forcefield
    //2. laser?
  }
}
