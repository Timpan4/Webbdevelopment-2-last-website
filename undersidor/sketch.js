var res = 40;
var scaledDownRes, scaledDownRes2;
var playingfield = [];
var playingfield_pc = [];
var randomSpot;
var boats_pc = [];
var dead_boats_pc = [];
var boats = [];
var boatAmount = 4;
var won = false;
var tries = 0;
var boatLen = 2;
var boatDir = 0;
var hit_spots_pc = [];
var hit_spots = [];

function setup() {
    createCanvas(1200, 600);
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


function draw() {

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
