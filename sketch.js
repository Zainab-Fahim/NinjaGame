/* 
						--- C O M M E N T R Y ---
• Extensions 
    1. Sounds 
        I added sound effects as shown in the tutorials. 
        All the sound effects were taken from http://opengameart.org/
    2. Platforms
        I used the factory pattern to draw the platforms
        After which using a for loop in the draw function, I ran the code
    3. Enemies
        I used the constructor function to draw the enemies
        After which using a for loop in the draw function, I ran the code
• The bits I found difficult 
	1. After adding in the particle system to create the fire effect, the processing speed of the game was drastically reduced. To deal with that I tampered with the frameRate(). It showed little difference. Therefore, I opted to make the game shorter, with less fire effects. This proved effectively to the run speed of the program
	2. I also faced difficulty while creating the tree (leaves) and enemies (spikes), because of the rotate() function. Setting it against the default axis, proved to be confusing.

• The skills I learnt/practiced by implementing it 
	1.	On a general note, I learnt patience, and coding with gapped period. This proved to be effective and give me a clear mind to solve any bugs I had previously encountered.
	2.	I also learned to ask help when necessary.
 */

	
// Game
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;
let angle=0;

// Character positions
var isLeft;
var isRight;
var isFalling;
var isPlummeting;

// Background 
var emit=[];
const numStars = 150;
const starX = [];
const starY = [];
var trees;
var clouds;
var mountains;

// Game dynamics
var canyons;
var collectables;
var platforms;
var enemies;

// Game points
var game_score;
var flagpole;
var lives;

// Sounds
var jumpSound;
var deathSound;
var gemSound;
var enemySound;
var victoryMusic;
var gameOver;
var fireSound;

// Images
var life;
var gem;

function preload()
{
    // Load sounds
    soundFormats('wav','mp3');
    
    // Jump sound
    jumpSound = loadSound('assets/sounds/jump.wav');
    jumpSound.setVolume(0.9);
    
    // Death sound
    deathSound = loadSound('assets/sounds/death.wav');
    deathSound.setVolume(0.5);
    
    // Gem collect
    gemSound = loadSound('assets/sounds/gem.wav');
    gemSound.setVolume(0.5);
    
    // Enemy sound
   enemySound = loadSound('assets/sounds/enemy.wav');
   enemySound.setVolume(0.5);
    
    // Flagpole reached
    victoryMusic = loadSound('assets/sounds/victory.mp3');
    victoryMusic.setVolume(0.2);
    
    // Game over
    gameOver = loadSound('assets/sounds/gameover.mp3');
    gameOver.setVolume(0.5);

	// Fire sounds
    fireSound = loadSound('assets/sounds/fire.wav');
    fireSound.setVolume(0.08);

	// Images
	life = loadImage('assets/images/ninja.png');
	gem = loadImage('assets/images/diamond.png');

}


function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
	frameRate(90);
	startGame();
	lives=3;
}
	

function draw()
{
	// Draw sky
	sky(0, 0, 1024, 576, blue, purple);

	// Draw star
	star();

	// Draw ground
	ground(0, floorPos_y, 3024, 176, green, brown);

    // Scrolling
    push();
	translate(scrollPos,0);
	
	// Draw clouds
	for (var i=0;i<clouds.length;i++)
	{
		clouds[i].draw();
	}

	// Draw mountains
	drawMountain();

	// Draw trees
	drawTree();

	// Draw enemies
	for (var i=0;i<enemies.length;i++)
	{
		enemies[i].draw();
		var isContact=enemies[i].checkContact(gameChar_world_x,gameChar_y);
		if (isContact)
		{
			if(lives>0)
			{
				deathSound.play();
				startGame();
				break;
			}
		}

	}

	// Draw platforms
	for (var i=0; i<platforms.length; i++)
	{
		platforms[i].draw();
	}
	
	// Draw ground
	ground(0, floorPos_y, 3024, 176, green, brown);

	//Draw pagodas
	drawPagoda();

	// Draw canyons
	for (var i=0; i<canyons.length;i++)
	{
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i]);
	}

	// Draw fire
	for (var j=0; j<emit.length; j++)
	{
		emit[j].updateParticles();
	}

	// Draw collectable items.
	for (var i=0; i<collectables.length;i++)
	{
		if(!collectables[i].isFound)
		{
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}
		
	} 

	//Draw Flagpole
	if(!checkFlagpole.isReached)
	{
		checkFlagpole();
	}
	drawFlagpole();

	// Pop scrolling
	pop();

	// Draw game character
	drawGameChar();

	// Draw game score
	push();
	fill(255);
	stroke(0);
	textSize(30);
	textStyle(BOLD);
	text(game_score,60,35);
	image(gem,10,0);
	pop();

	// Draw game over
	if (lives<0)
	{
		push();
		fill(255);
		stroke(0);
		textSize(40);
		textStyle(BOLD);
		text("Game Over",width/2-60,height/2-50);
		text("Press Space to continue",width/2-200,height/2);
		pop();
		//game over sound
		if(!gameOver.isPlaying())
		{
			gameOver.play();
			
		}
		return;	
	}
	// Draw level complete
	if (flagpole.isReached==true)
	{
		push();
		fill(255);
		stroke(0);
		textSize(40);
		textStyle(BOLD);
		text("You've Succeeded",width/2-60,height/2-50);
		pop();

		// play victory music
		if(!victoryMusic.isPlaying())
		{
			victoryMusic.play();
		}
		return;
	}

	// Game character movement & scroll logic
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 7;
		}
		else
		{
			scrollPos += 7;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 7;
		}
		else
		{
			scrollPos -= 7; 
		}
		if(isPlummeting)
		{
			gameChar_y += 5;
		}
	}

	// Game character gravity
    if(gameChar_y < floorPos_y)
    {
		var isContact=false;
		for (var i=0; i<platforms.length; i++)
		{
			if (platforms[i].checkContact(gameChar_world_x,gameChar_y)==true)
			{
				isContact=true;
				break;
			}

		}
		if (isContact==false)
		{
			gameChar_y += 2;
			isFalling = true;
		}
        
    }
    else
    {
        isFalling = false;
    }

    if(isPlummeting)
    {
        gameChar_y += 7;
    }
	
	//Game character update with scroll
	gameChar_world_x = gameChar_x - scrollPos;

	//check if player dead
	checkPlayerDie();
}


//--- K E Y  C O N T R O L  F U N C T I O N S ---

function keyPressed()
{
	//  LEFT / RIGHT / SPACE BAR keys are pressed.
	
	if(keyCode==37)
	{
		isLeft=true;
	}
	if (keyCode==39)
	{
		isRight=true;
	}
	if(keyCode == 32 && gameChar_y == floorPos_y)
    {
        gameChar_y -= 100;
        jumpSound.play();
    }
	if(keyCode == 32 && lives<0)
    {
		setup();
    }
}

function keyReleased()
{
	// LEFT / RIGHT keys are released.

	if(keyCode==37)
	{
		isLeft=false;
	}else if (keyCode==39)
	{
		isRight=false;
	}
}

//--- G A M E  C H A R A C T E R ---
function drawGameChar()
{
	//the game character
	if(isRight && isFalling)
	{
	// add your jumping-right code
	push();
	noStroke();
	rectMode(CENTER);
	angleMode(DEGREES);

	//BODY
	fill(27, 18, 18); //licorice
	rect(gameChar_x,gameChar_y-40,24,25);

	//HANDS
		//left
		push();
		translate(gameChar_x-15,gameChar_y-50);
		rotate(135);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();
		//right
		push();
		translate(gameChar_x+15,gameChar_y-50);
		rotate(45);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();

	//HEAD
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x,gameChar_y-60,30,25);

	//FACE
	fill(255,222,173); //navojwhite
	ellipse(gameChar_x+5,gameChar_y-60,20,13);

	//EYES 
		//left brow
		push();
		translate(gameChar_x+10,gameChar_y-62);
		rotate(30);
		fill(27, 18, 18); //licorice
		rect(gameChar_x-gameChar_x,gameChar_y-gameChar_y,8,2);
		pop();
		//left ball
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x+10, gameChar_y-59,3,3)

	//LEGS
		//left
		push();
		translate(gameChar_x-8,gameChar_y-30);
		rotate(110);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,30,9);
		pop();
		//right
		push();
		translate(gameChar_x+8,gameChar_y-30);
		rotate(95);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,30,9);
		pop();
		//BELT
		fill(200, 0, 0); //brick red
		rect(gameChar_x,gameChar_y-40,24,3);
		triangle();
		pop();

	}
	else if(isLeft && isFalling)
	{
		// add your jumping-left code
		
	push();
	noStroke();
	rectMode(CENTER);
	angleMode(DEGREES);

	//BODY
	fill(27, 18, 18); //licorice
	rect(gameChar_x,gameChar_y-40,24,25);

	//HANDS
		//left
		push();
		translate(gameChar_x-15,gameChar_y-50);
		rotate(135);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();
		//right
		push();
		translate(gameChar_x+15,gameChar_y-50);
		rotate(45);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();

	//HEAD
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x,gameChar_y-60,30,25);

	//FACE
	fill(255,222,173); //navojwhite
	ellipse(gameChar_x-5,gameChar_y-60,20,13);

	//EYES 
		//right brow
		push();
		translate(gameChar_x-9,gameChar_y-62);
		rotate(150);
		fill(27, 18, 18); //licorice
		rect(gameChar_x-gameChar_x,gameChar_y-gameChar_y,8,2);
		pop();
		//right ball
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-9, gameChar_y-58,3,3)
		
	//LEGS
		//left
		push();
		translate(gameChar_x-8,gameChar_y-30);
		rotate(85);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,30,9);
		pop();
		//right
		push();
		translate(gameChar_x+7,gameChar_y-30);
		rotate(70);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,30,9);
		pop();

	//BELT
	fill(200, 0, 0); //brick red
	rect(gameChar_x,gameChar_y-40,24,3);
	triangle();

	pop();

	}
	else if(isLeft)
	{
	// add your walking left code
	push();
	noStroke();
	rectMode(CENTER);

	//ROD
	push();
	translate(gameChar_x-18,gameChar_y-37);
	rotate(83);
	fill(192,192,192); //silver
	ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,50,5);
	pop();

	//BODY
	fill(27, 18, 18); //licorice
	rect(gameChar_x,gameChar_y-27,24,25);

	//HANDS
		//left
		push();
		translate(gameChar_x-15,gameChar_y-37);
		rotate(135);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();
		//right
		push();
		translate(gameChar_x+15,gameChar_y-37);
		rotate(45);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();

	//HEAD
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x,gameChar_y-47,30,25);

	//FACE
	fill(255,222,173); //navojwhite
	ellipse(gameChar_x-5,gameChar_y-47,20,13);

	//EYES 
		//right brow
		push();
		translate(gameChar_x-9,gameChar_y-47);
		rotate(150);
		fill(27, 18, 18); //licorice
		rect(gameChar_x-gameChar_x,gameChar_y-gameChar_y,8,2);
		pop();
		//right ball
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-9, gameChar_y-44,3,3)

	//LEGS
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x-8,gameChar_y-17,9,35);
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x+8,gameChar_y-17,9,35);

	//BELT
	fill(200, 0, 0); //brick red
	rect(gameChar_x,gameChar_y-27,24,3);
	triangle();

	pop();

	}
	else if(isRight)
	{
	// add your walking right code
	push();
	noStroke();
	rectMode(CENTER);
	angleMode(DEGREES);
	//ROD
	push();
	translate(gameChar_x+18,gameChar_y-37);
	rotate(100);
	fill(192,192,192); //silver
	ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,50,5);
	pop();

	//BODY
	fill(27, 18, 18); //licorice
	rect(gameChar_x,gameChar_y-27,24,25);

	//HANDS
		//left
		push();
		translate(gameChar_x-15,gameChar_y-37);
		rotate(135);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();
		//right
		push();
		translate(gameChar_x+15,gameChar_y-37);
		rotate(45);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();

	//HEAD
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x,gameChar_y-47,30,25);

	//FACE
	fill(255,222,173); //navojwhite
	ellipse(gameChar_x+5,gameChar_y-47,20,13);

	//EYES 
		//left brow
		push();
		translate(gameChar_x+10,gameChar_y-47);
		rotate(30);
		fill(27, 18, 18); //licorice
		rect(gameChar_x-gameChar_x,gameChar_y-gameChar_y,8,2);
		pop();
		//left ball
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x+10, gameChar_y-44,3,3)
		
	//LEGS
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-8,gameChar_y-17,9,35);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x+8,gameChar_y-17,9,35);

	//BELT
	fill(200, 0, 0); //brick red
	rect(gameChar_x,gameChar_y-27,24,3);
	triangle();

	pop();

	}
	else if(isFalling || isPlummeting)
	{
	// add your jumping facing forwards code
	push();
	noStroke();
	rectMode(CENTER);
	angleMode(DEGREES);
	//BODY
	fill(27, 18, 18); //licorice
	rect(gameChar_x,gameChar_y-40,24,25);

	//HANDS
		//left
		push();
		translate(gameChar_x-15,gameChar_y-50);
		rotate(135);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();
		//right
		push();
		translate(gameChar_x+15,gameChar_y-50);
		rotate(45);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();

	//HEAD
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x,gameChar_y-60,30,25);

	//FACE
	fill(255,222,173); //navojwhite
	ellipse(gameChar_x,gameChar_y-60,20,13);

	//EYES 
		//left brow
		push();
		translate(gameChar_x-4,gameChar_y-60);
		rotate(30);
		fill(27, 18, 18); //licorice
		rect(gameChar_x-gameChar_x,gameChar_y-gameChar_y,6,2);
		pop();
		//left ball
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-5, gameChar_y-57,2,2)
		//right brow
		push();
		translate(gameChar_x+4,gameChar_y-60);
		rotate(150);
		fill(27, 18, 18); //licorice
		rect(gameChar_x-gameChar_x,gameChar_y-gameChar_y,6,2);
		pop();
		//right ball
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x+5, gameChar_y-57,2,2)

	//LEGS
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x-8,gameChar_y-25,9,20);
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x+8,gameChar_y-25,9,20);

	//BELT
	fill(200, 0, 0); //brick red
	rect(gameChar_x,gameChar_y-40,24,3);
	triangle();

	pop();


	}
	else
	{
	// add your standing front facing code
	push();
	noStroke();
	rectMode(CENTER);
	angleMode(DEGREES);
	//ROD
	push();
	translate(gameChar_x,gameChar_y-37);
	rotate(135);
	fill(192,192,192); //silver
	ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,70,5);
	pop();
	//BODY
	fill(27, 18, 18); //licorice
	rect(gameChar_x,gameChar_y-27,24,25);
	//HANDS 
		//left
		push();
		translate(gameChar_x-15,gameChar_y-37);
		rotate(135);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();
		//right
		push();
		translate(gameChar_x+15,gameChar_y-37);
		rotate(45);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-gameChar_x,gameChar_y-gameChar_y,20,9);
		pop();
	//HEAD
	fill(27, 18, 18); //licorice
	ellipse(gameChar_x,gameChar_y-47,30,25);
	//FACE
	fill(255,222,173); //navojwhite
	ellipse(gameChar_x,gameChar_y-47,20,13);
	//EYES 
		//left brow
		push();
		translate(gameChar_x-4,gameChar_y-47);
		rotate(30);
		fill(27, 18, 18); //licorice
		rect(gameChar_x-gameChar_x,gameChar_y-gameChar_y,6,2);
		pop();
		//left ball
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-5, gameChar_y-44,2)
		//right brow
		push();
		translate(gameChar_x+4,gameChar_y-47);
		rotate(150);
		fill(27, 18, 18); //licorice
		rect(gameChar_x-gameChar_x,gameChar_y-gameChar_y,6,2);
		pop();
		//right ball
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x+5, gameChar_y-44,2,2)
	//LEGS
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x-8,gameChar_y-17,9,35);
		fill(27, 18, 18); //licorice
		ellipse(gameChar_x+8,gameChar_y-17,9,35);
	//BELT
	fill(200, 0, 0); //brick red 
	rect(gameChar_x,gameChar_y-27,24,3);
	pop();


	} 
};

//--- G R O U N D ---
function ground(x, y, width, height, c1, c2) 
{
	push();
	let amount;
	let gradient;

	for (let i = y; i <= y + height; i++) 
	{
		amount = map(i, y, y + height, 0, 1);
		gradient = lerpColor(c1, c2, amount);

		push();
		stroke(gradient);
		line(x, i, x + width+1000, i);
		pop();
	}
	pop();
}

//--- S K Y ---
function sky(x, y, width, height, c1, c2) 
{
    let amount;
    let gradient;


    for (let i = y; i <= y + height; i++) 
	{
        amount = map(i, y, y + height, 0, 1);
        gradient = lerpColor(c1, c2, amount);

        push();
        stroke(gradient);
        line(x, i, x + width, i);
        pop();
    }
}

//--- S T A R ---
function star()
{
	push();
	stroke(20, 37, 66, 255)
	strokeWeight(1)
	for (let i = 0; i < numStars; i++) 
	{
		fill(247, 233, 44, random(150, 255))
		const randomSize = random(4, 6)
		ellipse(starX[i], starY[i], randomSize, randomSize)
	}
	stroke(154, 211, 244, random(25, 50))
	strokeWeight(.8)
	pop();
}

//--- C L O U D S ---
// Cloud type 1
function Cloud1(x,y,width,height,range)
{
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.range=range;

	this.currentX=x;
	this.inc=1;

	this.update=function()
	{
		this.currentX+=this.inc;
		
		if(this.currentX>=this.x+this.range)
		{
			this.inc=-1;
		}
		else if(this.currentX<this.x)
		{
			this.inc=1;
		}
	}

	this.draw=function()
	{
        push();
		rectMode(CENTER);
		noStroke();
		this.update();
		translate(this.currentX, this.y);
		push();
		fill(230, 242, 255);
		rect(	50, 25,	this.width+110,this.height+5,10);
		ellipse(15, 10,	this.width-30, this.height+25);
		ellipse(45, 0,	this.width-25, this.height+35);
		ellipse(80, 0,	this.width-25, this.height+55);
		ellipse(105,10,	this.width-30, this.height+20);
		pop();
        pop();	
	}

}

// Cloud type 2
function Cloud2(x,y,width,height,range)
{
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.range=range;

	this.currentX=x;
	this.inc=0.5;

	this.update=function()
	{
		this.currentX+=this.inc;
		
		if(this.currentX>=this.x+this.range)
		{
			this.inc=-0.5;
		}
		else if(this.currentX<this.x)
		{
			this.inc=0.5;
		}
	}

	this.draw=function()
	{
		push();
		rectMode(CENTER);
		noStroke();
		fill(230, 242, 255);
		this.update();
		translate(this.currentX, this.y);
		push();
		rect(50,25,this.width+110,this.height+5,10);
		ellipse(-40,20,this.width-50,this.height+15);
		ellipse(-15,10,this.width-30,this.height+25);
		ellipse(5,0,this.width-25,this.height+35);
		ellipse(45,-10, this.width-5,this.height+70);
		ellipse(80,0,this.width-25,this.height+40);
		ellipse(105,10,this.width-30,this.height+25);
		ellipse(135,17,this.width-50,this.height+20);
		pop();
		pop();	
	}
}

// Cloud type 3
function Cloud3(x,y,width,height,range)
{
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.range=range;

	this.currentX=x;
	this.inc=0.5;

	this.update=function()
	{
		this.currentX+=this.inc;
		
		if(this.currentX>=this.x+this.range)
		{
			this.inc=-0.5;
		}
		else if(this.currentX<this.x)
		{
			this.inc=0.5;
		}
	}

	this.draw=function()
	{
		push();
		rectMode(CENTER);
		noStroke();
		fill(230, 242, 255);
		this.update();
		translate(this.currentX, this.y);
		push();
		rect(50,20,this.width+110,this.height+15,90);
		ellipse(20,10,this.width+10, this.height+20);
		ellipse(50,0, this.width+30, this.height+40);
		ellipse(80,10,this.width+10, this.height+20);
		pop();
		pop();	
	}
}

// Cloud type 4
function Cloud4(x,y,width,height,range)
{
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.range=range;

	this.currentX=x;
	this.inc=1.5;

	this.update=function()
	{
		this.currentX+=this.inc;
		
		if(this.currentX>=this.x+this.range)
		{
			this.inc=-0.5;
		}
		else if(this.currentX<this.x)
		{
			this.inc=1.5;
		}
	}

	this.draw=function()
	{
		push();
		rectMode(CENTER);
		noStroke();
		fill(230, 242, 255);
		this.update();
		translate(this.currentX, this.y);
		push();
		ellipse(50,17,this.width+130,this.width+5);
		ellipse(35,10,this.width+10, this.width+15);
		ellipse(65,0, this.width+25, this.width+35);
		ellipse(95,10,this.width+10, this.width+10);
		pop();
		pop();	
	}
}

// Cloud type 5
function Cloud5(x,y,width,height,range)
{
	this.x=x;
	this.y=y;
	this.width=width;
	this.height=height;
	this.range=range;

	this.currentX=x;
	this.inc=0.5;

	this.update=function()
	{
		this.currentX+=this.inc;
		
		if(this.currentX>=this.x+this.range)
		{
			this.inc=-1.5;
		}
		else if(this.currentX<this.x)
		{
			this.inc=0.5;
		}
	}

	this.draw=function()
	{
		push();
		rectMode(CENTER);
		noStroke();
		fill(230, 242, 255);
		this.update();
		translate(this.currentX, this.y);
		push();
		ellipse(50,17,	this.width+110,	this.height+5);
		ellipse(5, 5,	this.width,		this.height+25);
		ellipse(35,-10,	this.width+5,	this.height+50);
		ellipse(65,5,	this.width,		this.height+25);
		pop();
		pop();	
	}
}

//--- M O U N T A I N S ---
function drawMountain()
{
	for (var i=0; i<mountains.length;i++)
	{
		push();
		fill(138, 102, 66);
		stroke(92, 54, 35);
		strokeWeight(mountains[i].innerWidth);
		triangle(mountains[i].pos_x,mountains[i].pos_y,mountains[i].pos_x+mountains[i].width,mountains[i].pos_y,mountains[i].pos_x+mountains[i].width/2,mountains[i].pos_y-mountains[i].height);
		push();
		beginShape();
			fill(92, 54, 35);
			vertex(mountains[i].pos_x+mountains[i].width/2,mountains[i].pos_y-mountains[i].height); //top peak
			vertex(mountains[i].pos_x+mountains[i].width/2+mountains[i].innerWidth*2,mountains[i].pos_y-mountains[i].height/1.3);
			vertex(mountains[i].pos_x+mountains[i].width/2+mountains[i].innerWidth/4,mountains[i].pos_y-mountains[i].height/1.5);
			vertex(mountains[i].pos_x+mountains[i].width/2+mountains[i].innerWidth*4,mountains[i].pos_y-mountains[i].height/1.7);
			vertex(mountains[i].pos_x+mountains[i].width/2+mountains[i].innerWidth/8,mountains[i].pos_y-mountains[i].height/2); 	
			vertex(mountains[i].pos_x+mountains[i].width/2+mountains[i].innerWidth*6,mountains[i].pos_y-mountains[i].height/2.3);
			vertex(mountains[i].pos_x+mountains[i].width/2+mountains[i].innerWidth*5,mountains[i].pos_y-mountains[i].height/4); 	
			vertex(mountains[i].pos_x+mountains[i].width/2+mountains[i].innerWidth/5,mountains[i].pos_y-mountains[i].height/5); 	
			vertex(mountains[i].pos_x+mountains[i].width/2+mountains[i].innerWidth*4,mountains[i].pos_y-mountains[i].height/8); 	
			vertex(mountains[i].pos_x+mountains[i].width/2,mountains[i].pos_y);//bottom inner
			vertex(mountains[i].pos_x+mountains[i].width,mountains[i].pos_y); //left peak	
		endShape(CLOSE); 
		pop();
		pop();
	}
}

//--- T R E E S ---
function drawTree()
{
	for (var i=0; i<trees.length;i++)
	{
		push();
		angleMode(DEGREES);
		noStroke();
		//leaves
		push();
		fill(156, 226, 156);
		//corner1
			push();
			translate(trees[i].pos_x-90,trees[i].pos_y+7);
			rotate(135);
			fill(156, 226, 156);
			//right
			ellipse(-50,40,15,5); //2
			ellipse(0,-10,15,5); //3
			ellipse(40,-50,15,5); //4
			//left
			ellipse(-40,80,15,5); //5
			ellipse(0,40,15,5); //6
			ellipse(100,-60,15,5); //8		
			pop();
		//middle leaves
			push();
			translate(trees[i].pos_x-75,trees[i].pos_y);
			rotate(0);
			fill(156, 226, 156);
			//right
			ellipse(-3,-120,15,5); //1
			ellipse(-3,20,15,5); //3
			ellipse(-3,77,15,5);//4
			//right
			ellipse(-45,-87,15,5);//5
			ellipse(-45,-30,15,5); //6
			ellipse(-45,42,	15,5); //7
			pop();
		pop();
		//tree
		push();
		noStroke();
		rectMode(CENTER);
		//trunk
		fill(31, 122, 31);
		rect(trees[i].pos_x-100,trees[i].pos_y,15,300,10);
		//corner2
			push();
			translate(trees[i].pos_x-100,trees[i].pos_y+5);
			rotate(15);
			fill(156, 226, 156);
			//right
			ellipse(-15,-120,15,5);  //1
			ellipse(5,-50,15,5); //2
			ellipse(40,70,15,5); //4
			//left
			ellipse(-30,-35,15,5); //6
			ellipse(-15,35,15,5); //7
			ellipse(5,100,15,5); //8
			pop();
		//medella
		fill(185, 185, 70);
		ellipse(trees[i].pos_x-100,trees[i].pos_y,15,5);
		ellipse(trees[i].pos_x-100,trees[i].pos_y-50,15,5);
		ellipse(trees[i].pos_x-100,trees[i].pos_y-100,15,5);
		ellipse(trees[i].pos_x-100,trees[i].pos_y+50,15,5);
		ellipse(trees[i].pos_x-100,trees[i].pos_y+100,15,5);
		pop();
		pop();
	}
}

//--- P A G O D A ---
function drawPagoda()
{
    for (var i=0; i<pagodas.length;i++)
	{
	//draw the platform
	push();
	noStroke();
	fill(153, 0, 0);  
	rectMode(CENTER);
	//middle
	push();
	fill(128, 0, 0);
	rect(pagodas[i].pos_x+150, pagodas[i].pos_y-160, pagodas[i].length/9, pagodas[i].width*4);
	pop();
	//left
	push();
	fill(128, 0, 0); 
	triangle(pagodas[i].pos_x-20, pagodas[i].pos_y-180,
		pagodas[i].pos_x-20, pagodas[i].pos_y-180-(pagodas[i].width),
		pagodas[i].pos_x-40,pagodas[i].pos_y-200);
	pop();
	rect(pagodas[i].pos_x+40, pagodas[i].pos_y-50, pagodas[i].length/10, pagodas[i].width*15);
	
	//low pillars
	push();
	rect(pagodas[i].pos_x-pagodas[i].length/2.3+100, pagodas[i].pos_y+pagodas[i].length/2.5, pagodas[i].length/25, pagodas[i].width*2);
	rect((pagodas[i].pos_x-pagodas[i].length/2.3)+55+100, pagodas[i].pos_y+pagodas[i].length/2.5, pagodas[i].length/25, pagodas[i].width*2);
	rect(pagodas[i].pos_x+40, pagodas[i].pos_y+pagodas[i].length/2.5, pagodas[i].length/4, pagodas[i].width/2);
	pop();
	
	push();
	fill(173, 31, 31);
	rect(pagodas[i].pos_x+40, pagodas[i].pos_y-140, pagodas[i].length/7, pagodas[i].width);
	rect(pagodas[i].pos_x+40, pagodas[i].pos_y-160, pagodas[i].length/5, pagodas[i].width);
	rect(pagodas[i].pos_x+40, pagodas[i].pos_y-180, pagodas[i].length/3, pagodas[i].width);
	pop();

	
	//right
	push();
	fill(128, 0, 0); 
	triangle(pagodas[i].pos_x+pagodas[i].length+130, pagodas[i].pos_y-180,
		pagodas[i].pos_x+pagodas[i].length+130, pagodas[i].pos_y-180-(pagodas[i].width),
		pagodas[i].pos_x+pagodas[i].length+160,pagodas[i].pos_y-200);
	pop();	
	rect(pagodas[i].pos_x+260,pagodas[i].pos_y-50, pagodas[i].length/10, pagodas[i].width*15);
	
	//low pillars
	push();
	rect(pagodas[i].pos_x+pagodas[i].length/2.3+200, pagodas[i].pos_y+pagodas[i].length/2.5, pagodas[i].length/25, pagodas[i].width*2);
	rect((pagodas[i].pos_x+pagodas[i].length/2.3+200)-55,pagodas[i].pos_y+pagodas[i].length/2.5, pagodas[i].length/25, pagodas[i].width*2);
	rect(pagodas[i].pos_x+260, pagodas[i].pos_y+pagodas[i].length/2.5, pagodas[i].length/4, pagodas[i].width/2);
	pop();

	push();
	fill(173, 31, 31);
	rect(pagodas[i].pos_x+260, pagodas[i].pos_y-140, pagodas[i].length/7, pagodas[i].width);
	rect(pagodas[i].pos_x+260, pagodas[i].pos_y-160, pagodas[i].length/5, pagodas[i].width);
	rect(pagodas[i].pos_x+260, pagodas[i].pos_y-180, pagodas[i].length/3, pagodas[i].width);
	pop();

	pop();
	push();
	fill(128, 0, 0); 
	noStroke();

	//bottom
	rect(pagodas[i].pos_x-20, pagodas[i].pos_y-120, pagodas[i].length+150, pagodas[i].width-10);

	//Top
	rect(pagodas[i].pos_x-20, pagodas[i].pos_y-200, pagodas[i].length+150, pagodas[i].width);
	pop();
	push();
	pop();
    }
}

//--- C A N Y O N ---
// Function to draw canyon objects.
function drawCanyon(t_canyon)
{		
	// Draw collectable items
    push();
    rectMode(CENTER);
    noStroke();
    fill(138, 102, 66);
    rect(t_canyon.pos_x, t_canyon.pos_y, t_canyon.width, t_canyon.height);
    triangle(t_canyon.pos_x, t_canyon.pos_y + 10,
        t_canyon.pos_x - (t_canyon.width * 1.2), t_canyon.pos_y + (t_canyon.height / 2),
        t_canyon.pos_x + (t_canyon.width * 1.2), t_canyon.pos_y + (t_canyon.height / 2));
	fill(92, 54, 35);
	rect( t_canyon.pos_x, t_canyon.pos_y+t_canyon.height/2,t_canyon.width*3 ,15)
    pop();
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
	if(dist(gameChar_world_x,gameChar_y,t_canyon.pos_x,t_canyon.pos_y-(t_canyon.height/2))<20){
		isPlummeting=true;
   }
	if(dist(gameChar_world_x,gameChar_y,t_canyon.pos_x,t_canyon.pos_y-(t_canyon.height/2))<100){
		fireSound.play();
   }

}

//--- C O L L E C T A B L E ---
// Function to draw collectable objects.
function drawCollectable(t_collectable)
{
	push();
	noStroke();
	//down center
	fill(158, 227, 250);
	triangle(t_collectable.pos_x,t_collectable.pos_y,t_collectable.pos_x-10,t_collectable.pos_y-30,t_collectable.pos_x+10,t_collectable.pos_y-30);
	//down corner
	fill(134, 220, 249);
	triangle(t_collectable.pos_x,t_collectable.pos_y,t_collectable.pos_x-10,t_collectable.pos_y-30,t_collectable.pos_x-20,t_collectable.pos_y-33);
	triangle(t_collectable.pos_x,t_collectable.pos_y,t_collectable.pos_x+20,t_collectable.pos_y-33,t_collectable.pos_x+10,t_collectable.pos_y-30);
	// up center
	fill(85, 206, 246);
	quad(t_collectable.pos_x-10,t_collectable.pos_y-30,t_collectable.pos_x-7,t_collectable.pos_y-37,t_collectable.pos_x+7,t_collectable.pos_y-37,t_collectable.pos_x+10,t_collectable.pos_y-30);
	//up corner
	fill(110, 213, 247);
	quad(t_collectable.pos_x-20,t_collectable.pos_y-33,t_collectable.pos_x-13,t_collectable.pos_y-40,t_collectable.pos_x-7,t_collectable.pos_y-37,t_collectable.pos_x-10,t_collectable.pos_y-30);
	quad(t_collectable.pos_x+20,t_collectable.pos_y-33,t_collectable.pos_x+13,t_collectable.pos_y-40,t_collectable.pos_x+7,t_collectable.pos_y-37,t_collectable.pos_x+10,t_collectable.pos_y-30);
	//top
	push();
	beginShape();
		fill(134, 220, 249);
		vertex(t_collectable.pos_x-7, t_collectable.pos_y-37);
		vertex(t_collectable.pos_x-13, t_collectable.pos_y-40);
		vertex(t_collectable.pos_x-7, t_collectable.pos_y-42);
		vertex(t_collectable.pos_x+7, t_collectable.pos_y-42);
		vertex(t_collectable.pos_x+13, t_collectable.pos_y-40);
		vertex(t_collectable.pos_x+7, t_collectable.pos_y-37);
	endShape(CLOSE); 
	pop();
	pop();
}

// Function to check character has collected an item.
function checkCollectable(t_collectable)
{
	if(dist(gameChar_world_x,gameChar_y,t_collectable.pos_x,t_collectable.pos_y)<20)
	{
		t_collectable.isFound=true;
		//play gem sound
		gemSound.play();
		//increment score
		game_score+=1;
	};

}

//--- F L A G P O L E ---
function drawFlagpole ()
{
	//draw flagpole
	push();
	//draw pole
	strokeWeight(5);
	stroke(180);
	line(flagpole.pos_x,floorPos_y,flagpole.pos_x,flagpole.height);
	//draw flag
	noStroke();
	fill(255,255,0);
	//logic reached
	if (flagpole.isReached==true)
	{
		rect(flagpole.pos_x,flagpole.height,50,50);
	}else
	{
		rect(flagpole.pos_x,floorPos_y-50,50,50);
	}
	pop();
}

//--- P L A T F O R M ---
function createPlatforms(x,y,length)
{
	var p=
	{
		x:x,
		y:y,
		length:length,
		draw : function()
		{
			//draw the platform
			push();
			noStroke();
			fill(0);
			rectMode(CENTER);
			///--P I L L A R S--
			push();
			//TOP
			push();
			fill(20);
			rect(x+35,y-45,	20,60);	//left
			rect(x+80,y-60,	20,30); 	//center
			rect(x+125,y-60,	20,30); 	//center
			rect(x+length/1.5+30, y-45,20,60);	//right
			pop();
			//BOTTOM
			push();
			fill(20);
			rect(x-10,y+55,10,length/2);	//left
			rect(x+20,y+45,10,length/2); //left+1
			rect(x+75,y+45,10,length/2);	//left+2
			rect(x+length/2.5+50,y+45,10,length/2);//right-2
			rect(x+length/2.5+100,y+45,10,length/2);	//right-1
			rect(x+length/1.1+25,y+55,10,length/2);	//right
			pop();
			//HORIZONTAL
			push();
			fill(0);
			rect(x+99,y+65,length+length/20,5);	//top
			rect(x+99,y+80,length+length/20,5);	//bottom
			rect(x+99,y+100,length+length/3,15);	//base
			pop();
			pop();

			//--R O O F--
			push();
			//TOP
			push();
			fill(10);
			//main
			triangle(x+length/2, y-115,
				x+10, y-70,
				x+length-10, y-70);
			//left corner
			triangle(x+20-5, y-70-10,
				x+20+100, y-70,
				x+20-10, y-70);
			//right corner	
			triangle(x+length-20+5, y-70-10,
				x+length-20-100, y-70,
				x+length-20+10, y-70);
			pop();

			//BOTTOM
			push();
			fill(10);
			//pinacle
			rect(this.x+2+this.length/2-3, this.y-25,110,50);
			//main
			triangle(this.x+this.length/2, this.y-50,
				this.x-30, this.y+10,
				this.x+this.length+30, this.y+10);
			//left corner
			triangle(this.x-30, this.y,
				this.x+200, this.y+8,
				this.x-40, this.y+10);
			//right corner
			triangle(this.x+this.length+30, this.y,
				this.x+this.length-200, 	this.y+8,
				this.x+this.length+40, 	this.y+10);
			pop();
			pop();	//roof end
			pop();	//draw end
		},

		checkContact: function(gc_x,gc_y)
		{
			if(gc_x>this.x && gc_x<this.x+this.length)
			{
				var d=this.y-gc_y;
				if (d >=0 && d<5)
				{
					return true;
				}
			}
			return false;
		}
		
	}
	return p;
}

//--- G A M E  D Y N A M I C S ---
// Function to check character reach flagpole
function checkFlagpole()
{
	var d= abs(gameChar_world_x-flagpole.pos_x);
	if(d<15)
	{
		flagpole.isReached=true;
	}
}

// Function to check player life
function checkPlayerDie()
{
	if (gameChar_y > height)
	{
		lives--;
		if (lives>0)
		{
			deathSound.play();
			startGame();
		}
		
	}
	//top right lives counter
	for(var i = 0; i < lives; i++)
	{
		image(life, (width - 50) - (i * 40), 20);
	}
}

//--- E N E M I E S ---
function Enemy(x,y,range)
{
	this.x=x;
	this.y=y;
	this.range=range;

	this.currentX=x;
	this.inc=1;
	this.dist = 0;
    
	this.update=function()
	{
		this.currentX+=this.inc;
		this.dist = dist(gameChar_world_x, gameChar_y, this.currentX, this.y);

		if(this.currentX>=this.x+this.range)
		{
			this.inc=-1;
		}
		else if(this.currentX<this.x)
		{
			this.inc=1;
		}

		if(this.dist < 100)
		{
			enemySound.play();

		} 
	}

	this.draw=function()
	{
		push();
		fill(0);
		ellipse(x+50,y+10,range+80,4);
		angleMode(RADIANS)
		//draw enemy
			push();
			rectMode(CENTER);
			this.update();
			translate(this.currentX, this.y+10);
			rotate(angle);
			//drawing top
			push();
			angleMode(DEGREES);
			//black spikes
			push();
			noStroke();
			fill(0);
			//center
			push();
			rotate(0);
			triangle(10,-5,-10,-5,3,-30);
			pop();
			//right
			//1st top
			push();
			rotate(0);
			triangle(0,-10,-15,0,-25,-25);
			pop();
			//2nd top
			push();
			rotate(325);
			triangle(0,-10,-15,0,-25,-25);
			pop();
			//bottom
			push();
			rotate(0);
			//fill(255);
			triangle(-10,-8,-10,20,-37,12);
			pop();
			//left
			//top 1st
			push();
			rotate(310);
			triangle(10,-10,10,10,30,7);
			pop();
			//top 2nd
			push();
			rotate(350);
			triangle(10,-10,20,10,40,0);
			pop();
			//bottom
			push();
			rotate(0);
			triangle(15,-10,10,20,37,18);
			pop();
			pop();
			//draw sphere
			push();
			noStroke();
			fill(192,192,192);
			rotate(180);
			arc(0, -10, 40, 40, 0, 180, CHORD);
			pop();
			
			//silver spikes
			push();
			noStroke();
			fill(192,192,192);
			//center
			push();
			rotate(0);
			triangle(10,-5,-10,-5,3,-25);
			pop();
			//right
			//1st top
			push();
			rotate(0);
			triangle(0,-10,-15,0,-20,-20);
			pop();
			//2nd top
			push();
			rotate(325);
			triangle(0,-10,-15,0,-20,-20);
			pop();
			//bottom
			push();
			rotate(0);
			triangle(-10,-5,-10,10,-30,10);
			pop();
			//left
			//top 1st
			push();
			rotate(310);
			triangle(10,-5,10,10,25,5);
			pop();
			//top 2nd
			push();
			rotate(350);
			triangle(10,-5,20,10,33,0);
			pop();
			pop();
			pop();
			//____________________
			//______ D O W N _____
			//____________________
			push();
			angleMode(DEGREES);
			translate(0,12);
			rotate(180);
			
			//black spikes
			push();
			noStroke();
			fill(0);
			//center
			push();
			rotate(0);
			triangle(10,-5,-10,-5,3,-30);
			pop();
			//right
			//1st top
			push();
			rotate(0);
			triangle(0,-10,-15,0,-25,-25);
			pop();
			//left
			//top 1st
			push();
			rotate(310);
			triangle(10,-10,10,10,30,7);
			pop();
			pop();
			//draw sphere
			push();
			noStroke();
			fill(192,192,192);
			rotate(180);
			arc(0, -10, 40, 40, 0, 180, CHORD);
			pop();
			
			//silver spikes
			push();
			noStroke();
			fill(192,192,192);
			//center
			push();
			rotate(0);
			triangle(10,-5,-10,-5,3,-25);
			pop();
			//right
			//1st top
			push();
			rotate(0);
			triangle(0,-10,-15,0,-20,-20);
			pop();
			//2nd top
			push();
			rotate(325);
			triangle(-5,-10,-20,20,-25,-22);
			pop();
			//left
			//top 1st
			push();
			rotate(310);
			triangle(10,-5,10,10,25,5);
			pop();
			//top 2nd
			push();
				rotate(350);
				triangle(10,-5,10,10,30,6);
			pop();
			pop();

			//middle screw
			push();
			//sphere
			push();
			fill(100);
			stroke(0);
			strokeWeight(2);
			rotate(180);
			ellipse(0, -5, 23);
			pop();
			//nails
			push();
			noStroke();
			fill(0);
			ellipse(0,5,13,5);
			ellipse(0,5,5,13);
			pop();
			pop();	
			angle += 0.08;
			pop();
			pop();	
		pop();
	}

	this.checkContact=function(gc_x,gc_y)
	{
		var d=dist(gc_x,gc_y,this.currentX,this.y);
		if (d<20)
		{
			return true;
		}
		return false;
	}
}

//--- F I R E ---
// Function to create fire particles
function Particle(x, y, xSpeed, ySpeed, size, colour)
{
	this.x=x;
	this.y=y;
	this.xSpeed=xSpeed;
	this.ySpeed=ySpeed;
	this.size=size;
	this.colour=colour;
	this.age=0;

	this.drawParticle= function()
	{
		noStroke();
		fill (this.colour);
		ellipse(this.x,this.y,this.size/1.3);
	}

	this.updateParticle= function()
	{
		this.x+=this.xSpeed;
		this.y+=this.ySpeed;
		this.age++;
	}

}

// Function to create emitter effect
function Emitter(x, y, xSpeed, ySpeed, size, colour)
{
	this.x=x;
	this.y=y;
	this.xSpeed=xSpeed;
	this.ySpeed=ySpeed;
	this.size=size;
	this.colour=colour;

	this.startParticles=0;
	this.lifetime=0;

	this.particles=[];

	this.addParticle= function()
	{
		var p= new Particle(random(this.x-10,this.x+10), 
				random(this.y-10,this.y+10), 
				random(this.xSpeed-1/4,this.xSpeed+1/4), 
				random(this.ySpeed-2.5,this.ySpeed+1), 
				random(this.size-1/5,this.size+1/5), 
				this.colour);
		return p;
	}

	this.startEmitter= function(startParticles, lifetime)
	{
		this.startParticles=startParticles;
		this.lifetime=lifetime;

		//start emiteter with initial particles
		for(var i=0; i<startParticles; i++)
		{
			this.particles.push(this.addParticle());
		}
	}

	this.updateParticles = function(){
		// iterate through the particles and draw on the screen 
		var deadParticles=0;
		for(var i=0; i<this.particles.length; i++){
			this.particles[i].drawParticle();
			this.particles[i].updateParticle();
			if (this.particles[i].age>random(5,this.lifetime)){
				this.particles.splice(i,1);
				deadParticles++;
			}
		}
		if (deadParticles>0)
		{
			for(var i=0; i<deadParticles; i++)
			{
				this.particles.push(this.addParticle());
			}
		}
	}
	
}

function fire()
{
	for(var h=0; h<canyons.length;h++)
	{
		for (var i=0; i<canyons[h].width/10; i++)
		{
			emit[i]=new Emitter (canyons[h].pos_x, 600, 0, -1, 20, color(223, 70, 32,50));
			emit.push(emit[i]);
		}
		for (var j=0; j<emit.length; j++)
		{
			emit[j].startEmitter(100,400);
		}
	}
}

//--- G A M E  S E T U P ---
function startGame()
{
	
	gameChar_x = width/3-100;
	gameChar_y = floorPos_y;
	
	// Colors
	green = color(23, 130, 23);
	brown = color(77, 51, 25);
	blue = color(0, 0, 77);
	purple = color(103, 23, 130);

	// Scrolling
	scrollPos = 0;

	// Game score
	game_score=0;

	// Flagpole
	flagpole={isReached: false, pos_x:2650, height: 250};

	// Character positions
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
	// STARS
	for (let i = 0; i < numStars; i++) 
	{
		starX[i] = random(0, width)
		starY[i] = random(0, height * .95)
	}

	// TREE
	trees=[{pos_x:150, pos_y:300},
		{pos_x:850, pos_y:400},
		{pos_x:1220, pos_y:350},
		{pos_x:1550, pos_y:400},
		{pos_x:1700, pos_y:450},
		{pos_x:2050, pos_y:300},
		{pos_x:2150, pos_y:400},
		{pos_x:2550, pos_y:400}];
	
	// CLOUDS
	clouds=[];
	clouds.push(new Cloud1(200, 200, 80, 10, 400));
	clouds.push(new Cloud1(1500, 200, 80, 10, 400));
	clouds.push(new Cloud2(600, 100, 80, 10, 200));
	clouds.push(new Cloud2(2000, 100, 80, 10, 200));
	clouds.push(new Cloud3(100, 100, 30, 10, 400));
	clouds.push(new Cloud3(2500, 100, 80, 10, 400));
	clouds.push(new Cloud4(800, 60, 30, 10, 200));
	clouds.push(new Cloud4(2800, 60, 30, 10, 200));
	clouds.push(new Cloud5(1050, 200, 80, 20, 400));


	// MOUNTAINS
	mountains=[{pos_x:20, pos_y:450, width:250, height:200, innerWidth:10},
		{pos_x:150, pos_y:450, width:500, height:350, innerWidth:10},
		{pos_x:550, pos_y:450, width:200, height:150, innerWidth:8},
		{pos_x:700, pos_y:450, width:400, height:300, innerWidth:10},
		{pos_x:1100, pos_y:450, width:450, height:350, innerWidth:10},
		{pos_x:1400, pos_y:450, width:350, height:250, innerWidth:10},
		{pos_x:1000, pos_y:450, width:200, height:200, innerWidth:10},
		{pos_x:1700, pos_y:450, width:450, height:400, innerWidth:10},
		{pos_x:2000, pos_y:450, width:400, height:300, innerWidth:10},
		{pos_x:2500, pos_y:450, width:400, height:300, innerWidth:10},
		{pos_x:2350, pos_y:450, width:300, height:200, innerWidth:10}];

	// CANYON
	canyons=[{pos_x:600, pos_y:504, width:40, height:144, overCanyon:false},
			{pos_x:2100, pos_y:504, width:40, height:144, overCanyon:false}];
	
	// FIRE
	fire();
	
	// DIAMOND (collectable)
	collectables=[{pos_x:500,pos_y: 433,isFound:false},
		{pos_x:950,pos_y: 333,isFound:false},
		{pos_x:1250,pos_y: 370,isFound:false},
		{pos_x:1550,pos_y: 433,isFound:false},
		{pos_x:1800,pos_y: 333,isFound:false},
		{pos_x:2150,pos_y: 433,isFound:false},
	];

	// PAGODA
	pagodas=[{pos_x:100,pos_y: floorPos_y-100,length:200, width:20},
		{pos_x:2500,pos_y: floorPos_y-100,length:200, width:20}];

	// PLATFORMS
	platforms=[];
	platforms.push(createPlatforms(850, floorPos_y-100,200));
	platforms.push(createPlatforms(1700, floorPos_y-100,200));

	// ENEMIES
	enemies=[];
	enemies.push(new Enemy(1250, floorPos_y-10,100));
	enemies.push(new Enemy(2250, floorPos_y-10,100));
}

