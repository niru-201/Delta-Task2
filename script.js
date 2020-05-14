/** @type {HTMLCanvasElement} */
var cvs = document.getElementById("color");
var ctx = cvs.getContext("2d");
var start = document.getElementById("start");
var frame = document.getElementById("frame");
var pause = document.getElementById("pause");
var restart = document.getElementById("restart");
var status = true;
var timer;
var circl;
var obstacle = [];
var status;
var frst =15;
var scnd =15;
var powup_stat =0;
var powup_statd=0;
var colorc = [];
var colours =["aqua", "pink" ,"yellow", "purple"];
var obs_y = 10;
document.addEventListener("click", respond);
var score=0;
var hs = localStorage.getItem("highscore");
var music= new Audio("music.mp3");
var soundclick= new Audio("click.mp3");
const sprite = new Image();
sprite.src = "particle.png";
var isplaying = music.currentTime>0 && !music.pause;
var isplayings = soundclick.currentTime>0 && !soundclick.pause && soundclick.ended && soundclick.readyState >2;


start.addEventListener("click", function(){
	frame.appendChild(cvs);
	frame.removeChild(start);
  });
restart.addEventListener("click", function(){
	document.location.reload();
})  
dist = (x1,y1,x2,y2) =>{
    var a = x1-x2;
    var b = y1 -y2;
    return(Math.sqrt(a*a +b*b));
}
function Circle() {
	this.colour = colours[(Math.floor(Math.random() * colours.length))];
	this.radius = 7.5;
	this.y =cvs.height * 0.8;
	this.x =cvs.width / 2;

	this.disp = function() {
		ctx.beginPath();
		ctx.fillStyle = this.colour;
		ctx.arc(this.x, this.y, this.radius, 0,Math.PI*2,false);
		ctx.fill();
	}

	this.update = function() {
		this.y -= 3;}

	this.up = function() {
		if(this.y > 475){
		  this.update();}
		
	}

	this.changeColour = function() {
		var newColour = colours[(Math.floor(Math.random() * colours.length))];
		while (newColour == this.colour) {
			newColour = colours[(Math.floor(Math.random() * colours.length))];
		}
		this.colour = newColour;
	}
}
function Colorchange(x, y) {
	this.x = x;
	this.y = y; 
	this.radius = 16;
	this.n = 4;

	this.disp = function() {
		for (var i = 0; i < this.n; i++) {
			ctx.beginPath();
			ctx.fillStyle = colours[i];
			ctx.moveTo(this.x,this.y);
			ctx.arc(this.x, this.y, this.radius , 
				((Math.PI*2)/ this.n) * i, ((Math.PI*2)/ this.n) * (i + 1),false);
			ctx.fill();	
		}
	}

	this.update = function() {
			this.y += obs_y;
		}
	

	this.out = function() {
		return (this.y - this.radius > cvs.height);
	}

	this.collide = function() {
		var distCentre = dist(this.x, this.y, circl.x, circl.y);
		var sumRadii = this.radius + circl.radius;
		if(sumRadii >= distCentre)
		     return true;
		else
		     return false;   
	}
}
const powerup = {
	y1: -cvs.height-50,
	draw : function () {
	ctx.drawImage(sprite,317,298,217,201,cvs.width/2-40,this.y1,80,80);
	},
	update : function(){
		this.y1+=10;
	},
	check :function(){
		 if(this.y1>= 475)
		  {powup_stat=1;
		   powup_statd=1;
		   alert("U can hit any color for 30 sec");
		   setTimeout(function(){powup_stat=0},30000);   
		  }
	}
}

function CircleObstacle(x, y) {
	this.x = x;
	this.y = y;
	this.outerRadius = 80;
	this.innerRadius = 65;
	this.rotateOffset = 0;
	
	this.n = colours.length;
	this.botColour = [];
	this.topColour = [];

	this.disp = function() {
	
		for (var i = 0; i < this.n; i++) {
			var startAngle = (((Math.PI*2) / this.n) * i )+ this.rotateOffset;
			var endAngle = (((Math.PI*2) / this.n) * (i + 1)) + this.rotateOffset;
			ctx.beginPath();
			ctx.fillStyle = colours[i];
			ctx.moveTo(this.x,this.y);
			ctx.arc(this.x, this.y, this.outerRadius, 
				startAngle, endAngle,false);
			ctx.fill();	
			if ((startAngle % (Math.PI*2) >= 0) && (startAngle % (Math.PI*2) <= Math.PI/2)) {
				this.botColour = colours[i];
			} else if ((startAngle % (Math.PI*2) > Math.PI )&& (startAngle % (Math.PI*2) < 3*Math.PI/2)) {
				this.topColour = colours[i];
			}
		} 
		ctx.beginPath();
		ctx.fillStyle = 'black';
		ctx.arc(this.x, this.y, this.innerRadius, 0, Math.PI*2,false);
		ctx.fill();
	}
    this.rotate = function() {
		if(score<2)
		  this.rotateOffset += 0.02;
		else if(score>=2)
		   this.rotateOffset += 0.03;
		else if(score>=6)   
		   this.rotateOffset -=0.07;
	}
	this.update = function() {
			this.y += obs_y;
	}

	this.out = function() {
		return (this.y - this.outerRadius > cvs.height);
	}

	this.collide = function() {
		var botcollide = ((circl.y <= this.y + this.outerRadius+circl.radius)
							&& (circl.y >= -circl.radius +this.y+ this.innerRadius))
							&& (this.botColour != circl.colour);
		var topcollide = ((circl.y <= this.y - this.innerRadius + circl.radius)
							&& (circl.y >= -circl.radius + this.y - this.outerRadius))
							&& (this.topColour != circl.colour);
		return (botcollide || topcollide);
	}
}
 setup = () =>{
 frame.removeChild(cvs);
}
init = () =>{
    circl = new Circle();
    for(var i=0; i< 15; i++) 
    {
       colorc.push(new Colorchange(cvs.width/2,cvs.height*(1-2*i)/4));
       obstacle.push(new CircleObstacle(cvs.width/2,cvs.height*(1-i)/2 ));
    }
}
function respond() {
  circl.up();
  for(var i=0;i< frst;i++)
	obstacle[i].update();
  for(var j=0;j< scnd;j++)
	 colorc[j].update();
   powerup.update();
   circl.disp();
   if(powup_statd==0)
     powerup.check();
   soundclick.currentTime=0;
   soundclick.play();	
	if(!isplaying)
		{music.play();}	

}
gameover = () => {
ctx.clearRect(0,0,cvs.width,cvs.height);
			 ctx.font = "30px Arial";
			 ctx.fillStyle = "white";
			 ctx.fillText("Game Over",240,350);}
main = () =>{
	ctx.save();
	ctx.clearRect(0,0,cvs.width,cvs.height);
	circl.disp();
	best();
	score_disp();
    for(var j=0;j< scnd;j++){
         obstacle[j].disp();
		 circl.disp();
		 obstacle[j].rotate();
		 
         if(obstacle[j].out()){
			 obstacle.splice(j,1);
			 frst--;
		 } 
		 if(powup_stat==0){
           if(obstacle[j].collide())
         {
			 status = false;
			 clearInterval(timer);
			 best();
			 requestAnimationFrame(gameover);
		 }	
		}
	}
	for(var k=0;k <scnd;k++){
		  colorc[k].disp(); 
		  circl.disp();
	      while(colorc[k].collide())
		   {
			 colorc.splice(k,1);
			 circl.changeColour();
			 scnd--;
			 score++;
		   }
		}
		if(powup_statd==0)
		   powerup.draw();
	ctx.restore();	
	}

setup();	
init();
timer =setInterval(main ,30);
best = () =>{
if(hs != null){
  if(parseInt(hs) < score)
    localStorage.setItem("highscore",JSON.stringify(score));}
else
 localStorage.setItem("highscore",JSON.stringify(score));}
function score_disp(){
ctx.font = "30px Arial";
ctx.fillStyle = "white"
ctx.fillText("Score:"+ JSON.stringify(score),7,35); 

ctx.font = "30px Arial";
ctx.fillStyle = "white"
ctx.fillText("Best:"+ localStorage.getItem("highscore"),500,35);
}
