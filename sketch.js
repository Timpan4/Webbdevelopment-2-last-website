//variables
var toggledSpeed = false,
    won = false,
    home = false;
var counter = 0,
    highScore = 0,
    drawscore = 0,
    tries = 0,
    boatDir = 0,
    theGeneration = 0,
    xoff = 0;
var playingfield = [],
    playingfield_pc = [],
    boats_pc = [],
    dead_boats_pc = [],
    boats = [],
    hit_spots_pc = [],
    hit_spots = [],
    activeBirds = [],
    allBirds = [],
    pipes = [];
var bestBird, savedBestBird, alive, everySlider, everySpan, generations, im1, im2, bodyclass, battleship, scaledDownRes, scaledDownRes2, randomSpot;
var res = 40;
var every = 1;
var boatAmount = 4;
var boatLen = 2;
var totalPopulation = 400;
var regex = /\d/;


$(document).ready(function () {
    var clicked = true;
    $(".links a").hover(function () {
        $(".backgrounde").appendTo(this).addClass("showing").slideDown(250);
        // let pos = $(this).position();
    }, function () {
        $(".backgrounde").slideUp(0, function () {
            $(".backgrounde").removeClass("showing");
        });
    });
    $(".gallery > div:gt(0)").hide();
    setInterval(function () {
        $(".gallery > div:first")
            .fadeOut(1000) //gömmer den bilden som syns just nu
            .next() //säger åt koden att gå till nästa syskon
            .fadeIn(1000) //säger åt de syskonet att fadea in
            .end() // hoppar tillbaka till den div som syns just nu
            .appendTo(".gallery"); //lägger till den diven sist i .bildspel för att .next och .end ska fungera och hoppa vidare till nästa div.


    }, 3000);
    $("body").keydown(function (vilkenKnapp) {
        var knappen = vilkenKnapp.keyCode;
        if (knappen == 13) {
            submitForm();
        }
    });

    //formulär hantering
    $(".submit").click(submitForm);

    $(".games").click(function () {
        if (clicked) {
            $(".dropper").slideDown(250);
            $(".dropper").position({
                my: "center top",
                at: "center bottom",
                of: this, // or $("#otherdiv")
                collision: "fit"
            });
            clicked = false;
        } else {
            $(".dropper").slideUp(250);
            clicked = true;
        }
    });
    bodyclass = $("body").hasClass("flappy");
    battleship = $("body").hasClass("battleships");
    home = $("body").hasClass("home");
    $("#togglespeed").click(function () {
        toggledSpeed = toggleSpeed();
    });

});

function submitForm() {
    var name = $("input[type=name]").val();
    console.log(name);
    var email = $("input[type=email]").val();
    if (name != "" && !regex.test(name) && email != null && email.indexOf('@') > -1 && email.indexOf('.') > -1) {
        $(".sent").fadeIn(500).delay(3000).fadeOut(500);

    } else {
        $(".fail").fadeIn(500).delay(3000).fadeOut(500);
    }
}
//THE GAME

function toggleSpeed() {
    return toggledSpeed ? false : true;
}


function setup() {
    if (!home) {
        if (bodyclass) {
            createCanvas(800, 600);
        } else {
            createCanvas(1200, 600);
        }
    }
    // im1 = loadImage('bird.png');
    // im2 = loadImage('bird_flap.png');
    if (battleship) {
        //get the scaled down res so i can easily create cordinations for the playingfields
        scaledDownRes = innerWidth / res;
        scaledDownRes2 = innerHeight / res;

        //generate all the spots in the playingfields
        for (let j = 0; j < scaledDownRes2; j++) {
            for (let i = 0; i < scaledDownRes; i++) {
                if (((i >= 2 && i <= 11) && (j >= 2 && j <= 11))) {
                    playingfield.push([i - 2, j - 2]);
                } else if ((i >= 17 && i <= 26) && (j >= 2 && j <= 11)) {
                    playingfield_pc.push([i - 2, j - 2]);
                }
            }
        }

        //generate the pc's boats
        for (let i = 1; i <= boatAmount; i++) {
            randomSpot = random(playingfield_pc);
            let randomDir = round(random());
            let l = i == 1 ? 2 : i;
            let boat = new Boat(l, randomSpot, randomDir, false);
            boats_pc.push(boat);
        }
    }
    if (bodyclass) {
        if (Cookies.get("bestBird") != undefined && Cookies.get("bestBird") != null && JSON.parse(Cookies.get("bestBird"))) {
            let cookieBird = JSON.parse(Cookies.get("bestBird"));
            savedBestBird = new Bird(cookieBird, true);
        }
        // Create a population
        if (savedBestBird != undefined) {
            for (let i = 0; i < totalPopulation; i++) {
                activeBirds[i] = savedBestBird;
                allBirds[i] = savedBestBird;
            }
        } else {
            for (let i = 0; i < totalPopulation; i++) {
                let bird = new Bird();
                activeBirds[i] = bird;
                allBirds[i] = bird;
            }
            // activeBirds[totalPopulation - 1] = new Bird();
        }
    }
}




function draw() {
    if (bodyclass) {
        let cycles = 1;
        let tempHighScore = -1;
        if (toggledSpeed) {
            cycles = 24;
        }

        // How many times to advance the game
        for (let n = 0; n < cycles; n++) {
            // Show all the pipes
            for (let i = pipes.length - 1; i >= 0; i--) {
                pipes[i].update();
                if (pipes[i].offscreen()) {
                    pipes.splice(i, 1);
                }
            }
            let tempBestBird = null;
            for (let i = activeBirds.length - 1; i >= 0; i--) {
                let bird = activeBirds[i];
                let s = bird.score;
                if (s > tempHighScore) {
                    tempHighScore = s;
                    tempBestBird = activeBirds[i];
                }

                // Bird uses its brain!
                bird.think(pipes);
                bird.update();
                for (let k = 0; k < pipes.length; k++) {
                    if (bird.scored(pipes[k])) {
                        bird.score++;
                        pipes[k].scored = true;
                    }
                }
                // Check all the pipes
                for (let j = 0; j < pipes.length; j++) {
                    // It have hit a pipe
                    if (pipes[j].hits(activeBirds[i])) {
                        // Remove this bird
                        activeBirds.splice(i, 1);
                        break;
                    }
                }
                if (bird.bottomTop()) {
                    activeBirds.splice(i, 1);
                }

                // Is it the all time high scorer?
                if (tempHighScore > highScore) {
                    highScore = tempHighScore;
                    bestBird = tempBestBird;
                    if (savedBestBird != null && bestBird.score > savedBestBird.score) {
                        Cookies.set("bestBird", JSON.stringify(bestBird.brain.copy()));
                    }
                }
            }


            // Add a new pipe every so often
            if (counter % 50 == 0) {
                xoff += 7.5;
                pipes.push(new Pipe(xoff));
            }
            counter++;
        }
        if (activeBirds.length == 0) {
            theGeneration++;
            nextGeneration();
        }

        drawscore++;

        if (drawscore % every == 0) {
            background(51);
            for (let i = 0; i < activeBirds.length; i++) {
                activeBirds[i].show();
            }
        }
        for (let i = 0; i < pipes.length; i++) {
            pipes[i].show();
        }
    } else if (battleship) {
        //update the inputs
        boatLen = $(".lengthB").val();
        boatDir = $(".dirB").val();
        if (boatLen > 4) {
            boatLen = 4;
        }
        if (boatLen < 2) {
            boatLen = 2;
        }
        if (boatDir > 1) {
            boatDir = 1;
        }
        $(".dirB").val(boatDir);
        $(".lengthB").val(boatLen);
        //test the pc's boats
        testBoats();
        background(51);
        //draw both playingfields
        for (let i = 0; i < playingfield_pc.length; i++) {
            fill(151);
            strokeWeight(2);
            stroke(0);
            rect((playingfield[i][0] + 2) * res, (playingfield[i][1] + 2) * res, res, res);
            rect((playingfield_pc[i][0] + 2) * res, (playingfield_pc[i][1] + 2) * res, res, res);
        }
        //draw the pc's boats
        for (let i = 0; i < boats_pc.length; i++) {
            let boat = boats_pc[i];
            boat.draw();
        }
        // if (boats.length != 0) {
        //draw your boats
        for (let i = 0; i < boats.length; i++) {
            let boat = boats[i];
            boat.draw();
        }

        //draw the hit spots and draw it green or red depending on hit or not: hit = green
        for (let i = 0; i < hit_spots.length; i++) {
            fill(255, 0, 0);
            stroke(0);
            if (hit_spots[i] != undefined) {
                for (let k = 0; k < boats_pc.length; k++) {
                    for (let j = 0; j < boats_pc[k].allSpots.length; j++) {
                        if (boats_pc[k].allSpots[j][0] == hit_spots[i][0] && boats_pc[k].allSpots[j][1] == hit_spots[i][1]) {
                            fill(0, 255, 120);
                            boats_pc[k].hit(boats_pc[k].allSpots[j]);
                        }
                    }
                }
            }
            ellipse((hit_spots[i][0] + 2) * res + 0.5 * res, (hit_spots[i][1] + 2) * res + 0.5 * res, 0.5 * res, 0.5 * res);
        }
        //draw the hit spots for the pc and draw it green or red depending on hit or not: hit = green
        for (let i = 0; i < hit_spots_pc.length; i++) {
            fill(255, 0, 0);
            stroke(0);
            if (hit_spots_pc[i] != undefined) {
                for (let k = 0; k < boats.length; k++) {
                    for (let j = 0; j < boats[k].allSpots.length; j++) {
                        if (boats[k].allSpots[j][0] == hit_spots_pc[i][0] && boats[k].allSpots[j][1] == hit_spots_pc[i][1]) {
                            fill(0, 255, 120);
                            boats[k].hit(boats[k].allSpots[j]);
                        }
                    }
                }
            }
            ellipse((hit_spots_pc[i][0] + 2) * res + 0.5 * res, (hit_spots_pc[i][1] + 2) * res + 0.5 * res, 0.5 * res, 0.5 * res);
        }
        //create the dot depending on mouse position
        for (let i = 0; i < playingfield_pc.length; i++) {
            let mx = ceil(mouseX / res) - 3;
            let my = ceil(mouseY / res) - 3;
            if (mx == playingfield_pc[i][0] && my == playingfield_pc[i][1]) {
                fill(0);
                stroke(0);
                ellipse((playingfield_pc[i][0] + 2) * res + 0.5 * res, (playingfield_pc[i][1] + 2) * res + 0.5 * res, 0.5 * res, 0.5 * res);
            }
        }
        // }
        fill(255);
        stroke(0);
        placeBoat();
        if (endGame() && !won) {
            alert("PLAYER WON");
            won = true;
        }
    }

}

$("#saved").click(function () {
    let json = JSON.parse(Cookies.get("bestBird"));
    saveJSON(json, "bestbird.json");

});
//FUNCTIONS

// Mutation function to be passed into bird.brain
function mutate(x) {
    if (random(1) < 0.1) {
        let offset = randomGaussian() * 0.5;
        let newx = x + offset;
        return newx;
    } else {
        return x;
    }
}

class Bird {
    constructor(brain, best) {
        if (best == undefined) {
            best = false;
        }
        // position and size of bird
        this.x = 64;
        this.y = height / 2;
        this.r = 20;
        this.top = this.y - this.r;
        this.bottom = this.y + this.r;

        // Gravity, lift and velocity
        this.gravity = 0.8;
        this.lift = -12;
        this.velocity = 0;

        // Is this a copy of another Bird or a new one?
        // The Neural Network is the bird's "brain"
        if (brain instanceof NeuralNetwork) {
            this.brain = new NeuralNetwork(brain, true);
            this.brain.mutate(mutate);
        } else if (best) {
            this.brain = new NeuralNetwork(brain, true);
        } else {
            this.brain = new NeuralNetwork(5, false, 10, 2);
        }

        // Score is how many frames it's been alive
        this.score = 0;
        // Fitness is normalized version of score
        this.fitness = 0;
    }

    // Create a copy of this bird
    copy() {
        return new Bird(this.brain);
    }

    // Display the bird
    show() {
        imageMode(CENTER);
        // fill(255, 100);
        // stroke(255);
        ellipse(this.x, this.y, this.r, this.r);
        // if (this.velocity > 0) {
        //     image(im1, this.x, this.y, this.r * 2, this.r * 2);
        // } else {
        //     image(im2, this.x, this.y, this.r * 2, this.r * 2)
        // }
    }

    // This is the key function now that decides
    // if it should jump or not jump!
    think(pipes) {
        // First find the closest pipe
        let closest = null;
        let record = Infinity;
        for (let i = 0; i < pipes.length; i++) {
            let diff = pipes[i].x - this.x;
            if (diff > 0 && diff < record) {
                record = diff;
                closest = pipes[i];
            }
        }

        if (closest != null) {
            // Now create the inputs to the neural network
            let inputs = [];
            // x position of closest pipe
            inputs[0] = map(closest.x, this.x, width, 0, 1);
            // top of closest pipe opening
            inputs[1] = map(closest.top, 0, height, 0, 1);
            // bottom of closest pipe opening
            inputs[2] = map(closest.bottom, 0, height, 0, 1);
            // bird's y position
            inputs[3] = map(this.y, 0, height, 0, 1);
            // bird's y velocity
            inputs[4] = map(this.velocity, -5, 5, 0, 1);

            // Get the outputs from the network
            let action = this.brain.predict(inputs);
            // Decide to jump or not!
            if (action[1] > action[0]) {
                this.jump();
            }
        }
    }

    // Jump up
    jump() {
        this.velocity += this.lift;
    }

    bottomTop() {
        // Bird dies when hits bottom and top
        return this.y > height || this.y < 0;
    }

    // Update bird's position based on velocity, gravity, etc.
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
        this.top = this.y - this.r;
        this.bottom = this.y + this.r;
    }
    // Increase birds score for every pipe it cleares
    scored(pipe) {
        return this.x == pipe.x + pipe.w;
    }
}

//THE PIPES
class Pipe {
    constructor(xoff) {
        // How big is the empty space
        let spacing = 135;

        // Where is the center of the empty space between the pipes based on perlinnoise
        let centery = map(noise(xoff), 0, 1, spacing, height - spacing);

        // Top and bottom of pipe
        this.top = centery - spacing / 2;
        this.bottom = height - (centery + spacing / 2);

        // Starts at the edge
        this.x = width;
        // Width of pipe
        this.w = 50;
        // How fast
        this.speed = 6;
    }

    // Did this pipe hit a bird?
    hits(bird) {
        return (bird.top < this.top || bird.bottom > height - this.bottom) && (bird.x > this.x && bird.x < this.x + this.w);
    }

    // Draw the pipe
    show() {
        stroke(255);
        fill(200);
        rect(this.x, 0, this.w, this.top);
        rect(this.x, height - this.bottom, this.w, this.bottom);
    }

    // Update the pipe
    update() {
        this.x -= this.speed;
    }

    // Has it moved offscreen?
    offscreen() {
        return this.x < -this.w;
    }
}


// All the functions for starting the game over
function resetGame() {
    counter = 0;
    // Resetting best bird score to 0
    if (bestBird) {
        bestBird.score = 0;
    }
    pipes = [];
}

// Create the next generation
function nextGeneration() {
    resetGame();
    // Normalize the fitness values 0-1
    normalizeFitness(allBirds);
    // Generate a new set of birds
    activeBirds = generate(allBirds);
    // Copy those birds to another array
    allBirds = activeBirds.slice();
}

// Generate a new population of birds
function generate(oldBirds) {
    // Create new new array to copy birds to
    let newBirds = [];
    for (let i = 0; i < oldBirds.length; i++) {
        // Select a bird based on fitness
        let bird = poolSelection(oldBirds);
        newBirds[i] = bird;
    }
    // Retunr the new array as the new generation
    return newBirds;
}

// Normalize the fitness of all birds
function normalizeFitness(birds) {
    let sum = 0;
    for (let i = 0; i < birds.length; i++) {
        // Make score exponentially better to reward birds even more if the go further
        birds[i].score = pow(birds[i].score, 2);
    }
    // Add up all the scores
    for (let i = 0; i < birds.length; i++) {
        sum += birds[i].score;
    }

    // Divide the exponentially better score with the sum to create a fitness with a number between
    // 0-1 where 1 is better than 0
    for (let i = 0; i < birds.length; i++) {
        birds[i].fitness = birds[i].score / sum;
    }
}


// An algorithm for picking one bird from an array
// based on fitness
function poolSelection(birds) {
    // Start at 0
    let index = 0;
    // Pick a random number between 0 and 1
    let r = random(1);
    // Keep subtracting the fitness until you get less than zero
    // Higher fitness will be more likely to be fixed since they will
    // subtract a larger number towards zero
    while (r > 0) {
        r -= birds[index].fitness;
        // And move on to the next
        index += 1;
    }
    // If r < 0 go back one to select the bird that made r < 0
    index -= 1;
    // Copy of the bird, bird.copy() mutates the brain aswell
    return birds[index].copy();
}

//battleships
//boat class
class Boat {
    constructor(length, pos, dir, player) {
        this.length = length;
        this.x = pos[0];
        this.y = pos[1];
        this.dir = dir;
        this.player = player;
        this.allSpots = [];
        this.hitSpots = [];
        this.dead = false;
        //checking if the pc's newly created boat is outside the playingfield
        if (!this.player && ((this.x < 17) || (this.x > 25 - length && dir == 0) || (this.y > 10 - length && dir == 1))) {
            //create a new boat with random direction and new random spot
            let newSpot = random(playingfield_pc);
            let newDir = round(random());
            return new Boat(this.length, newSpot, newDir, this.player);
        }
        //create an array with the boats all spots on the playingfield
        for (let i = 0; i < this.length; i++) {
            if (dir == 0) {
                this.allSpots.push([this.x + i, this.y]);
            } else {
                this.allSpots.push([this.x, this.y + i]);
            }
        }
    }
    //remake the boat
    remake(newSpot, newDir) {
        return new Boat(this.length, newSpot, newDir, this.player);

    }
    //draw al the spots
    draw() {
        //check if the boat is dead
        if (this.allSpots.length == this.hitSpots.length) {
            this.dead = true;
        }
        stroke(255);

        //check if the boat is red and make it red or green fill depending on that + draw all spots
        for (let i = 0; i < this.length; i++) {
            if (this.dead) {
                fill(255, 0, 0);
            } else {
                if (this.player) {
                    fill(0, 255, 0);
                } else {
                    fill(151);
                    strokeWeight(2);
                    stroke(0);
                }
            }
            rect((this.allSpots[i][0] + 2) * res, (this.allSpots[i][1] + 2) * res, res, res);
        }
    }
    //if the boat is hit this function will be called
    hit(spot) {
        //add the spot that hit the boat
        this.hitSpots.push(spot);
        //check if that spot already is in the array and remove duplicates
        for (let i = 0; i < this.hitSpots.length; i++) {
            let spot1 = this.hitSpots[i];
            for (let j = 0; j < this.hitSpots.length; j++) {
                let spot2 = this.hitSpots[j];
                if (i != j && spot1[0] == spot2[0] && spot1[1] == spot2[1]) {
                    this.hitSpots.splice(j, 1);
                }
            }
        }
    }
}

function testBoats() {
    if (!won) {
        for (let i = 0; i < boats_pc.length; i++) {
            //check if the boat has spots otherwise remove it
            if (boats_pc[i].allSpots == []) {
                boats_pc = boats_pc.splice(i, 1);
            }
            //create a new random spot and random direction
            let randomSpot = random(playingfield_pc);
            let randomDir = round(random());
            let boatSpots1 = boats_pc[i].allSpots;
            let boatSpots2;
            //take the next boat
            if (i + 1 < boats_pc.length) {
                boatSpots2 = boats_pc[i + 1].allSpots;
            } else {
                boatSpots2 = boats_pc[0].allSpots;
            }

            //check if the pc's boats are overlapping and remake them if they are
            for (let j = 0; j < boatSpots1.length; j++) {
                let spot1 = boatSpots1[j];
                for (let h = 0; h < boatSpots2.length; h++) {
                    let spot2 = boatSpots2[h];
                    if (spot1 == spot2) {
                        if (i + 1 < boats_pc.length) {
                            boats_pc[i + 1] = boats_pc[i + 1].remake(randomSpot, randomDir);
                        } else {
                            boats_pc[0] = boats_pc[0].remake(randomSpot, randomDir);
                        }
                    }
                }
            }
        }
    }
}

function mouseClicked() {
    if (battleship) {
        if (!won) {
            let hit_pc = false;
            //get the mouse pos
            let mx = ceil(mouseX / res) - 3;
            let my = ceil(mouseY / res) - 3;
            //place new boat
            for (let i = 0; i < playingfield.length; i++) {
                if (mx == playingfield[i][0] && my == playingfield[i][1]) {
                    placeBoat(true);
                    // tries++;
                }
            }
            // if (boats.length != 0) {
            //add the new hitspot to the array
            for (let i = 0; i < playingfield_pc.length; i++) {
                if (mx == playingfield_pc[i][0] && my == playingfield_pc[i][1]) {
                    hit_spots.push(playingfield_pc[i]);
                    hit_pc = true;
                }
            }
            if (hit_spots.length > 0) {
                //test if the spot you placed is already in the array and then remove the duplicates
                for (let i = 0; i < hit_spots.length; i++) {
                    let spot1 = hit_spots[i];
                    for (let j = 0; j < hit_spots.length; j++) {
                        let spot2 = hit_spots[j];
                        if (spot1[0] == spot2[0] && spot1[1] == spot2[1] && j != i) {
                            hit_spots.splice(j, 1);
                            hit_pc = false;
                        }
                    }
                }
            }
            if (hit_pc) {
                //pc random hitspot
                var hitspot = random(playingfield);
                let newspot = true;
                //test if the hitspot is
                if (hit_spots_pc.length > 0) {
                    while (newspot) {
                        for (let j = 0; j < hit_spots_pc.length; j++) {
                            if (hit_spots_pc[j][0] == hitspot[0] && hit_spots_pc[j][1] == hitspot[1]) {
                                hitspot = random(playingfield);
                                break;
                            } else {
                                newspot = false;
                            }
                        }
                    }
                }
                hit_spots_pc.push(hitspot);
            }
        }
    }
}

// }


function placeBoat(newBoat) {
    if (!won) {
        //get the mouse pos on the playingfield
        let mx = ceil(mouseX / res) - 3;
        let my = ceil(mouseY / res) - 3;

        //check if you can place more boats or not
        for (let i = 0; i < boats.length; i++) {
            if (boatLen == 2) {
                if (tries >= 2) {
                    newBoat = false;
                }
            } else if (boatLen == boats[i].length && boatLen != 2) {
                newBoat = false;
            }
        }

        var boat = new Boat(boatLen, [mx, my], boatDir, true);
        //check if the new boat is going to be placed on another spot
        for (let i = 0; i < boats.length; i++) {
            let spots = boats[i].allSpots;
            for (let j = 0; j < spots.length; j++) {
                let spots2 = boat.allSpots;
                for (let k = 0; k < spots2.length; k++) {
                    if (spots[j][0] == spots2[k][0] && spots[j][1] == spots2[k][1]) {
                        newBoat = false;
                        break;
                    }
                }
            }
        }
        //add the new boat to the array
        if (newBoat) {
            boats.push(boat);
            //increase the tries if the boat length is equal to 2
            if (boatLen == 2) {
                tries++;
            }
        }

        //Draw the higlight of where the boat will be placed
        for (let i = 0; i < playingfield.length; i++) {
            if (mx == playingfield[i][0] && my == playingfield[i][1]) {
                let boat = [mx, my];
                for (let j = 0; j < boatLen; j++) {
                    if (boatDir == 1) {
                        boat = [mx, my + j];
                    } else {
                        boat = [mx + j, my];
                    }
                    rect((boat[0] + 2) * res, (boat[1] + 2) * res, res, res);
                }
            }
        }
    }
}

function endGame() {

    //check if the boats is dead
    let amount_player = 0;
    let amount_pc = 0;
    let amount = 0;
    let player = true;
    for (let i = 0; i < boats_pc.length; i++) {
        if (boats_pc[i].dead) {
            amount_player++;
        }
    }
    for (let i = 0; i < boats.length; i++) {
        if (boats[i].dead) {
            amount_pc++;
        }
    }
    if (amount_pc == 4 && amount_player < amount_pc) {
        player = false;
    }
    amount = player ? amount_player : amount_pc;
    return amount == 4 ? true : false;
}
