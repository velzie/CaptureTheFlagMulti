var socket = io();
var packet = {};
function setup() {
createCanvas(1400,700);
frame(null);
}
function frame(all) {
if (all != null){
  strokeWeight(0);
  background(0);
  fill(255,0,0);
  rect(0,0,700,700);
  //^^^^^^^^
  //bluebase
  fill(0,0,255);
  rect(700,0,700,700);
  //redbase
  fill(0,255,0);
  rect(680,0,40,700);
  //dividingline
  fill(0);
  rect(550,0,300,100);
  fill(255);
  rect(680,0,40,100);
  textSize(40);
  textAlign(CENTER,CENTER);
  text(all[0][0],550,0,150,100);
  text(all[0][1],700,0,150,100);
  strokeWeight(5);
  fill(100,50,50);
  rect(all[1][0].x,all[1][0].y,20,20);
  fill(50,50,100);
  rect(all[1][1].x,all[1][1].y,20,20);
  for (var power of all[3]) {
    fill(0,255,255);
    rect(power.x,power.y,20,20);
  }
    //flags
for (var player of all[2]) {
strokeWeight(5);
  if (player.team == 0){
    fill(255,0,0);
  }else{
    fill(0,0,255);
  }
  rect(player.x,player.y,20,20);
}

}
packet = {mouseX:mouseX,mouseY:mouseY,mouseIsPressed:mouseIsPressed,keys:{}};
for (var i = 3; i < 255; i++) {
  packet.keys[i] = keyIsDown(i);
}
socket.emit('packet',packet);
}
socket.on('drawdata',(all)=>frame(all));
