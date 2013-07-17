//DEFINES



CL_R = 0;
CL_G = 1;
CL_B = 2;

MAP_TYPE =  0;
MAP_ITEM =  1;
    MAP_TYPE_EMPTY =    0;
    MAP_TYPE_RESOURCE = 1;
    MAP_TYPE_MATERIAL = 2;
    MAP_TYPE_ORGANISM = 3;

ORG_ID =           0;
ORG_TYPE =         1;
ORG_DESIRE =          2;
ORG_CL =           3;
ORG_RAWSTOR =      4;
ORG_REFINEDSTOR =  5;
ORG_STRENGTH =     6;
ORG_DIDCONSUME =   7;
ORG_DEMEANOR =     8;
ORG_ATTR =         9;
ORG_DIDCONVERT =      10;

    ORG_TYPE_PRODUCER =         0;
    ORG_TYPE_CONSUMER =         1;

    ORG_DEMEANOR_HELPFUL =      0;
    ORG_DEMEANOR_PASSIVE =      1;
    ORG_DEMEANOR_AGGRESSIVE =   2;

    ORG_ATTR_REPOCHANCE = 0;
    ORG_ATTR_REPOAT = 1;
    ORG_ATTR_MAXSTRENGTH = 2;
    ORG_ATTR_MOVECHANCE = 3;




BG_COLOR = [0,25,51];

//Fix the shitty JS Mod and lack of clone
Number.prototype.mod = function(n) { return ((this%n)+n)%n; }


var TPS_filterStrength = 5;
var TPS_frameTime = 0, TPS_lastLoop = new Date, TPS_thisLoop;

var FPS_filterStrength = 5;
var FPS_frameTime = 0, FPS_lastLoop = new Date, FPS_thisLoop;

function gameLoopTick(){
  var TPS_thisFrameTime = (TPS_thisLoop=new Date) - TPS_lastLoop;
  TPS_frameTime+= (TPS_thisFrameTime - TPS_frameTime) / TPS_filterStrength;
  TPS_lastLoop = TPS_thisLoop;
}

function gameLoopFrame(){
  var FPS_thisFrameTime = (FPS_thisLoop=new Date) - FPS_lastLoop;
  FPS_frameTime+= (FPS_thisFrameTime - FPS_frameTime) / FPS_filterStrength;
  FPS_lastLoop = FPS_thisLoop;
}

// Report the fps only every second, to only lightly affect measurements
$(document).ready(function(){
    var tpsOut = document.getElementById('fps');
    setInterval(function(){
      tpsOut.innerHTML = (1000/TPS_frameTime).toFixed(1) + " tps<br />"+
                         (1000/FPS_frameTime).toFixed(1) + " fps<br />Tick: "+global_tick;
    },1000);
});

global_tick = 0;

Colors:[]; //TODO, populate with "pretty" colors

pond = {
    //variables
    cellWall:true,
    mutationChance:20,
    flowChance:2,
    producerSpawnChance:20,
    consumerSpawnChance:10,
    resouceThreshold:30,
    singleRender:false,
    resourceSpawnChance:40,
    plantStartMoveChance:15,
    bulkOdd:1,
    width:5,
    height:5,
    resources:[
        [0,51,102],
        [0,0,102],
        [51,0,102],
    ],
    materials:[
        [0,128,255],
        [0,0,255],
        [127,0,255],
    ],

    //functions
    init:function(){
        draw.init(this.width,this.height);
        helpers.init(this.width,this.height);
        this.org_id_max = 0;
        //fill resourcesNames
        for(var i in this.resources) if (this.resources.hasOwnProperty(i))
        {
            this.resourcesNames.push(i);
        }

        //fill material names
        for(var i in this.materials) if (this.materials.hasOwnProperty(i))
        {
            this.materialsNames.push(i);
        }

        //createIntialMap
        this.total = this.width * this.height;
        for(var i=0;i<this.total;i++){
            this.map[i] = [];
        }

        //intialFill
        for(var i=0;i<this.total;i++){
            if(true){
                this.map[i] = [MAP_TYPE_EMPTY];
            } else {
                this.map[i] = [MAP_TYPE_RESOURCE,this.giveRandomResource()];
            }
        }

        _lastmousex = -1;
        _lastmousey = -1;
        $(draw.pond).mousemove(function(ev){
            var x = Math.floor((ev.offsetX-5)/draw.scale);
            var y = Math.floor((ev.offsetY-5)/draw.scale);
            if(x != _lastmousex || y != _lastmousey){
                    _lastmousex = x;
                    _lastmousey = y;
                    var mapo = pond.map[parseInt(helpers.cartToIndex(x,y))];
                    $('#info').text(JSON.stringify(mapo));
            }
        });
        global_tick = 0;

        for(var i=0;i<50;i++){
            this.map[Math.floor(Math.random()*this.total)] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_PRODUCER)];
            this.map[Math.floor(Math.random()*this.total)] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_CONSUMER)];
        }
        $("#pond").click(function(){
            console.log('test');
            for(var i=0;i<50;i++){
                pond.map[Math.floor(Math.random()*pond.total)] = [MAP_TYPE_ORGANISM,pond.makeRandomOrganism(ORG_TYPE_PRODUCER)];
                pond.map[Math.floor(Math.random()*pond.total)] = [MAP_TYPE_ORGANISM,pond.makeRandomOrganism(ORG_TYPE_CONSUMER)];
            }
        });

    },
    step:function(){
        gameLoopTick();
        global_tick++;
        this.processMap();
        this.pushPop();
        this.flowResMats();
        this.insertRandomLife();
        this.processMap();
        this.processOrgs();
        if(!this.singleRender && global_tick.mod(this.bulkOdd)==0){
            this.render();
        }
    },
    insertRandomLife:function(){
        //TODO implement a threshold for life generation
        /*if(helpers.chance(this.producerSpawnChance)){
            var spot = Math.floor(Math.random()*this.total);
            this.map[spot] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_PRODUCER)];
            if(this.singleRender) this.renderOne(spot);
        }
        else if(helpers.chance(this.consumerSpawnChance)){
            var spot = Math.floor(Math.random()*this.total);
            this.map[spot] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_CONSUMER)];
            if(this.singleRender) this.renderOne(spot);
        }*/
    },
    flowResMats:function(){
        var listr = this.lists[MAP_TYPE_RESOURCE].slice(0);
        var listm = this.lists[MAP_TYPE_MATERIAL].slice(0);
        var list = listr.concat(listm);
        list.sort(function(){ return .5 - Math.random(); });
        for(var l in list){
            if(!helpers.chance(this.flowChance)) continue;
            var i = list[l];
            var sides = helpers.getSides(i);
            var matches = 0;
            for(var s in sides){
                var side = sides[s];
                if(this.map[i][MAP_TYPE] == this.map[side][MAP_TYPE] &&
                   this.map[i][MAP_ITEM] == this.map[side][MAP_ITEM]) matches++;
            }
            if(!helpers.chance(matches*4)) continue;
            var d = Math.floor(Math.random()*4);
            if(this.map[sides[d]][MAP_TYPE] == MAP_TYPE_ORGANISM) continue;
            var c = this.map[i];
            var t = this.map[sides[d]];
            this.map[sides[d]] = c;
            this.map[i] = t;
            if(this.singleRender){
                this.renderOne(i);
                this.renderOne(sides[d]);
            }
        }
    },
    pushPop:function(){
        var pempty = (this.currents[MAP_TYPE_EMPTY]/this.total)*100;
        if( pempty < 100-this.resouceThreshold) return;

        var list = this.lists[MAP_TYPE_EMPTY].slice(0);
        list.sort(function(){ return 0.5 - Math.random(); });
        for(var i in list) if(helpers.chance(this.resourceSpawnChance)){
            var spot = list[i];
            this.map[spot] = [MAP_TYPE_RESOURCE,this.giveRandomResource()];
            if(this.singleRender) this.renderOne(spot);
        }
    },
    processOrgs:function(){
        var list = this.lists[MAP_TYPE_ORGANISM].slice(0);
        list.sort(function(){ return .5 - Math.random(); });
        for(i in list){
            var oi = list[i];
            this.map[oi][MAP_ITEM][ORG_DIDCONSUME] = false;
            this.map[oi][MAP_ITEM][ORG_DIDCONVERT] = false;
            this.orgEat(oi);
            this.orgInteract(oi);
            this.orgProduce(oi);
            this.orgReproduce(oi);
            this.orgExcrete(oi);
            oi = this.orgMove(oi);
            this.orgLife(oi);
        }
    },
    orgMove:function(i){
        var o = this.map[i][MAP_ITEM];
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER && (o[ORG_DIDCONVERT] || !helpers.chance(o[ORG_ATTR][ORG_ATTR_MOVECHANCE]))) return i;

        var cxy = helpers.indexToCart(i);
        var domove = false;
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            if(o[ORG_DIDCONVERT]) var checker = function(a){ return (pond.map[a][MAP_TYPE] == MAP_TYPE_ORGANISM && o[ORG_ID] == pond.map[a][MAP_ITEM][ORG_ID]); }
            else var checker = function(a){ return (pond.map[a][MAP_TYPE] == MAP_TYPE_RESOURCE && o[ORG_DESIRE] == pond.map[a][MAP_ITEM]); }
        } else {
            var checker = function(a){ return (pond.map[a][MAP_TYPE] == MAP_TYPE_MATERIAL && o[ORG_DESIRE] == pond.map[a][MAP_ITEM]); }
        }

        for(var d=1;d<10;d++){
            //l
                var ci = helpers.getRelative(i,0,d);
                if(checker(ci)){ domove = true; var moved = 0;}
                if(!domove)
                for(var s=d;s>=0;s--){
                    if(checker(helpers.getRelative(ci,2,s)) || checker(helpers.getRelative(ci,3,s))) { domove = true; var moved = 0; break;}
                }
            //r
            if(!domove){
                ci = helpers.getRelative(i,1,d);
                if(!domove)
                for(var s=d;s>=0;s--){
                    if(checker(helpers.getRelative(ci,2,s)) || checker(helpers.getRelative(ci,3,s))) { domove = true; var moved = 1; break;}
                }
            }
            //u
            if(!domove){
                ci = helpers.getRelative(i,2,d);
                if(!domove)
                for(var s=d-1;s>=0;s--){
                    if(checker(helpers.getRelative(ci,0,s)) || checker(helpers.getRelative(ci,1,s))) { domove = true; var moved = 2; break;}
                }
            }
            //d
            if(!domove){
                ci = helpers.getRelative(i,3,d);
                if(!domove)
                for(var s=d-1;s>=0;s--){
                    if(checker(helpers.getRelative(ci,0,s)) || checker(helpers.getRelative(ci,1,s))) { domove = true; var moved = 3; break;}
                }
            }

            if(domove){
                break;
            }
        }
        if(!domove){
            var moved = Math.floor(Math.random()*4);
        }
        var sides = helpers.getSides(i);
        for(var cc=0;cc<4;cc++){
            if(this.map[sides[moved]][MAP_TYPE] != MAP_TYPE_ORGANISM) break;
            moved = Math.floor(Math.random()*4);
            if(cc == 3) return i;
        }
        var tmp = this.map[sides[moved]];
        this.map[sides[moved]] = this.map[i];
        this.map[i] = tmp;
        if(this.singleRender){
            this.renderOne(i);
            this.renderOne(sides[moved]);
        }
        return sides[moved];
    },
    orgEat:function(i){
        var o = this.map[i][MAP_ITEM];

        var sides = helpers.getSides(i);
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            for(var s in sides){
                var side = sides[s];
                if(this.map[side][MAP_TYPE] != MAP_TYPE_RESOURCE || o[ORG_DESIRE] != this.map[side][MAP_ITEM]) continue;
                this.map[side] = [MAP_TYPE_EMPTY];
                o[ORG_RAWSTOR]++;
                o[ORG_DIDCONSUME] = true;
            }
        } else if(o[ORG_TYPE] == ORG_TYPE_CONSUMER){
            for(var s in sides){
                var side = sides[s];
                if(this.map[side][MAP_TYPE] != MAP_TYPE_MATERIAL || o[ORG_DESIRE] != this.map[side][MAP_ITEM]) continue;
                this.map[side] = [MAP_TYPE_EMPTY];
                o[ORG_REFINEDSTOR]++;
                o[ORG_DIDCONSUME] = true;
            }
        } else alert('UNKNOWN organism TYPE');

    },
    orgInteract:function(i){
        //TODO Implement Passive and Aggressive interactions
        // return;
        var o = this.map[i][MAP_ITEM];
        var sides = helpers.getSides(i);
        sides.sort(function(){ return 0.5 - Math.random(); });
        for(var s in sides){
            var side = sides[s];
            var demeanor = o[ORG_DEMEANOR];
            if(this.map[side][MAP_TYPE] != MAP_TYPE_ORGANISM) continue;

            var so = this.map[side][MAP_ITEM];
            if(o[ORG_ID] == so[ORG_ID]) demeanor = ORG_DEMEANOR_HELPFUL;

            switch(demeanor){
                case ORG_DEMEANOR_HELPFUL:
                    this.orgShare(o,so);
                    break;
                case ORG_DEMEANOR_PASSIVE:

                    break;
                case ORG_DEMEANOR_AGGRESSIVE:

                    break;
            }
        }
    },
    orgShare:function(o,so){
        if(o[ORG_TYPE] != ORG_TYPE_PRODUCER || o[ORG_ID] != i[ORG_ID] || o[ORG_RAWSTOR] > so[ORG_RAWSTOR]+1) return;
        o[ORG_RAWSTOR]--;
        so[ORG_RAWSTOR]--;
    },
    orgProduce:function(i){
        //TODO look over and improve
        var o = this.map[i][MAP_ITEM];
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            if(o[ORG_RAWSTOR] <= 0) return;
            o[ORG_RAWSTOR]--;
            o[ORG_REFINEDSTOR]++;
            o[ORG_DIDCONVERT]=true;
        } else if(o[ORG_TYPE] == ORG_TYPE_CONSUMER){
            if(o[ORG_REFINEDSTOR] <= 0) return;
            o[ORG_REFINEDSTOR]--;
            o[ORG_RAWSTOR]++;
            o[ORG_DIDCONVERT]=true;
        } else alert('UNKNOWN organism TYPE');
    },
    orgExcrete:function(i){
        //TODO Look over and check this.
        var o = this.map[i][MAP_ITEM];
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER && o[ORG_REFINEDSTOR] > 0){
            var sides = helpers.getSides(i);
            sides.sort(function(){ return .5 - Math.random(); });
            for(var s in sides){
                if(this.map[sides[s]][MAP_TYPE] == MAP_TYPE_EMPTY){
                    this.map[sides[s]] = [MAP_TYPE_MATERIAL,o[ORG_DESIRE]];
                    if(this.singleRender) this.renderOne(sides[s]);
                    o[ORG_REFINEDSTOR]--;
                    break;
                }
            }
        }
    },
    orgLife:function(i){
        var o = this.map[i][MAP_ITEM];

        var gain = false;
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER && o[ORG_DIDCONVERT]) gain = true;
        else if(o[ORG_TYPE] == ORG_TYPE_CONSUMER && o[ORG_DIDCONSUME]) gain = true;

        if(gain){
            if(o[ORG_STRENGTH] < o[ORG_ATTR][ORG_ATTR_MAXSTRENGTH]) o[ORG_STRENGTH]+=20;
        } else{
            o[ORG_STRENGTH]-=2;
        }
        if(o[ORG_STRENGTH] < 0){
            var maptype=MAP_TYPE_EMPTY;
            var mapitem=null;
            if(o[ORG_TYPE] == ORG_TYPE_PRODUCER && o[ORG_REFINEDSTOR]>0){
                    maptype=MAP_TYPE_MATERIAL;
            }
            else if(o[ORG_TYPE] == ORG_TYPE_CONSUMER && o[ORG_RAWSTOR]>0){
                    maptype=MAP_TYPE_RESOURCE;
            }

            if(maptype == MAP_TYPE_EMPTY) this.map[i]=[MAP_TYPE_EMPTY];
            else this.map[i]=[maptype,o[ORG_DESIRE]];
        }
    },
    orgReproduce:function(i){
        var o = this.map[i][MAP_ITEM];
        if(!helpers.chance(o[ORG_ATTR][ORG_ATTR_REPOCHANCE]) || o[ORG_STRENGTH] < o[ORG_ATTR][ORG_ATTR_REPOAT]) return;

        var sides = helpers.getSides(i);

        var possible = [];
        for(var s in sides) if(this.map[sides[s]][MAP_TYPE] == MAP_TYPE_EMPTY) possible.push(sides[s]);
        if(possible.length == 0) return;
        possible.sort(function(){ return 0.5 - Math.random(); });
        o[ORG_STRENGTH] = Math.ceil(o[ORG_STRENGTH]*0.75);
        var newo = jQuery.extend(true,[],o);
        newo[ORG_RAWSTOR] = 0;
        newo[ORG_REFINEDSTOR] = 0;
        if(helpers.chance(this.mutationChance)){
            newo[ORG_ID] = this.org_id_max; this.org_id_max++;
            newo[ORG_ATTR][ORG_ATTR_REPOCHANCE]+=Math.floor(Math.random()*3)-1;
            newo[ORG_ATTR][ORG_ATTR_MOVECHANCE]+=Math.max(Math.floor(Math.random()*3)-1,1);
            newo[ORG_ATTR][ORG_ATTR_REPOAT]+=Math.floor(Math.random()*5)-2;
            newo[ORG_ATTR][ORG_ATTR_MAXSTRENGTH]+=Math.floor(Math.random()*9)-4;
            if(o[ORG_TYPE]!=ORG_TYPE_CONSUMER) newo[ORG_CL][CL_R]=(newo[ORG_CL][CL_R]+Math.floor(Math.random()*61)-30).mod(200);
            if(o[ORG_TYPE]!=ORG_TYPE_PRODUCER) newo[ORG_CL][CL_G]=(newo[ORG_CL][CL_G]+Math.floor(Math.random()*61)-30).mod(200);
            newo[ORG_CL][CL_B]=(newo[ORG_CL][CL_B]+Math.floor(Math.random()*61)-30).mod(200);
        }
        this.map[possible[0]] = [MAP_TYPE_ORGANISM, newo];
        if(this.singleRender) this.renderOne(possible[0]);
    },
    render:function(){
        for(var i=0;i<this.total;i++){
            this.renderOne(i);
        }
        draw.render();
        gameLoopFrame();
    },
    renderOne:function(i){
        switch(this.map[i][MAP_TYPE]){
            case MAP_TYPE_EMPTY:
                draw.point(i,BG_COLOR[CL_R],BG_COLOR[CL_G],BG_COLOR[CL_B]);
                break;
            case MAP_TYPE_RESOURCE:
                var color = this.resources[this.map[i][MAP_ITEM]];
                draw.point(i,color[CL_R],color[CL_G],color[CL_B])
                break;
            case MAP_TYPE_MATERIAL:
                var color = this.materials[this.map[i][MAP_ITEM]];
                draw.point(i,color[CL_R],color[CL_G],color[CL_B])
                break;
            case 3:
                var color = this.map[i][MAP_ITEM][ORG_CL];
                if(this.cellWall)
                    draw.pointStroke(i,color[CL_R],color[CL_G],color[CL_B],'black');
                else
                    draw.point(i,color[CL_R],color[CL_G],color[CL_B]);
                break;
        }
    },
    clearListsCounts:function(){
        this.lists = [];
        this.currents = [];
        for(var i=0;i<this.mapTypesCount;i++){
            this.lists.push([]);
            this.currents.push(0);
        }
    },
    processMap:function(){
        this.clearListsCounts();
        for(var i in this.map){
            var type = this.map[i][MAP_TYPE];
            this.lists[type].push(parseInt(i));
            this.currents[type]++;
        }
    },
    //generators
    giveRandomResource:function(){
        return this.resourcesNames[Math.floor(Math.random()*(this.resourcesNames.length))];
    },
    giveRandomMaterial:function(){
        return this.materialsNames[Math.floor(Math.random()*(this.materialsNames.length))];
    },
    makeRandomOrganism:function(type){
        //TODO make organisms a little more random from the get
        var o = [];
        o[ORG_ID] = this.org_id_max; this.org_id_max++;
        o[ORG_TYPE] = type;
        o[ORG_DESIRE] = o[ORG_TYPE]==ORG_TYPE_PRODUCER?this.giveRandomResource():this.giveRandomMaterial();
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            o[ORG_CL] = [51,255,51];
        } else {
            o[ORG_CL] = [255,51,51]
        }
        o[ORG_RAWSTOR] = 0;
        o[ORG_REFINEDSTOR] = 0;
        o[ORG_STRENGTH] = 50;
        o[ORG_DIDCONSUME] = false;
        o[ORG_DEMEANOR] = helpers.bool()?ORG_DEMEANOR_HELPFUL:ORG_DEMEANOR_PASSIVE;
        o[ORG_ATTR] = [];
        o[ORG_ATTR][ORG_ATTR_REPOCHANCE] = 2;
        o[ORG_ATTR][ORG_ATTR_REPOAT] = 80;
        o[ORG_ATTR][ORG_ATTR_MAXSTRENGTH] = 200;
        o[ORG_ATTR][ORG_ATTR_MOVECHANCE] = 2;
        return o;
    },

    //static holders
    mapTypesCount:4,
    total:null,
    resourcesNames:[],
    materialsNames:[],
    map:[],
    currents:[],
    lists:[]
}


helpers = {
    width:null,
    height:null,
    total:null,
    init:function(width,height){
        this.width = width;
        this.height = height;
        this.total = width*height;
    },
    indexToCart:function(i){
        var x = i%this.width;
        var y = Math.floor(i/this.width);
        return[x,y];
    },
    cartToIndex:function(x,y){
        return (x + y * this.width);
    },
    getSides:function(i){
        i = parseInt(i);

        l = (i.mod(this.width) == 0)?i+this.width-1:(i-1);
        r = (i.mod(this.width) == this.width-1)?i-this.width+1:(i+1);
        u = (i+this.width).mod(this.total);
        d = (i-this.width).mod(this.total);

        return [l,r,u,d];
    },
    getRelative:function(i,d,l){
        switch(d){
            case 0:
                return (i.mod(this.width)-l<0)?(i-l+this.width):(i-l);
                break;
            case 1:
                return (i.mod(this.width)+l>this.width-1)?(i+l-this.width):(i+l);
                break;
            case 2:
                return (i+(this.width*l)).mod(this.total);
                break;
            case 3:
                return (i-(this.width*l)).mod(this.total);
                break;
        }
    },
    bool:function(){
        return Math.floor(Math.random()*2)===1;
    },
    chance:function(odd){
        return Math.floor(Math.random()*odd)===0;
    }
}

// seedrandom.js version 2.2.
// Author: David Bau
// Date: 2013 Jun 15
//
// LICENSE (BSD):
//
// Copyright 2013 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 */
(function (
    global, pool, math, width, chunks, digits) {

//
// The following constants are related to IEEE 754 limits.
//
var startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1;

//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function(seed, use_entropy) {
  var key = [];

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    use_entropy ? [seed, tostring(pool)] :
    0 in arguments ? seed : autoseed(), 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function() {         // Closure to return a random double:
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return shortseed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability discard an initial batch of values.
    // See http://www.rsa.com/rsalabs/node.asp?id=2009
  })(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj)[0], prop;
  if (depth && typ == 'o') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 's' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto if available.
//
/** @param {Uint8Array=} seed */
function autoseed(seed) {
  try {
    global.crypto.getRandomValues(seed = new Uint8Array(width));
    return tostring(seed);
  } catch (e) {
    return [+new Date, global, global.navigator.plugins,
            global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
})(
  this,   // global window object
  [],     // pool: entropy pool starts empty
  Math,   // math: package containing random, pow, and seedrandom
  256,    // width: each RC4 output is 0 <= x < 256
  6,      // chunks: at least six RC4 outputs for each double
  52      // digits: there are 52 significant digits in a double
);
