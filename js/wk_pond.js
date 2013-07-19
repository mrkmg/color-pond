//Webworker

importScripts('helpers.js');    

self.addEventListener('message', function(e) {
  var data = e.data.data;
  switch (e.data.cmd) {
    case 'seed':
        importScripts('randomseed.js');
        Math.seedrandom(data);
    case 'init':
        pond.init(data.width,data.height);
        break;
    case 'setOption':
        pond[data.option] = parseInt(data.value);
        break;
    case 'getOption':
        report('type',{option:data,value:pond[data]});
        break;
    case 'cmap':
        pond.render();
        report('cmap',bytes);
        break;
    case 'stats':
        report('stats',[getTpm(),global_tick,pond.currents]);
        break;
    case 'getItem':
        report('getItem',pond.map[parseInt(data)]);
        break;
    case 'start':
        start();
        break;
    case 'stop':
        stop();
        break;
    case 'die':
        self.close();
        break;
    default:
      report('error','unknown command');
  };
}, false);

console = {
    log:function(){report('log',arguments)}
}

function report(type,value){
    self.postMessage({type:type,value:value});
}

var stepTO = null;

var toTime = 10;

running = false;

function runStep(){
    if(!running) return;
    pond.step();
    var stepTO = setTimeout(runStep,pond.stepWait)
};

function start(){
    running=true;
    runStep();
}

function stop(){
    running=false;
}




CL_R = 0;
CL_G = 1;
CL_B = 2;

MAP_TYPE =  0;
MAP_ITEM =  1;
    MAP_TYPE_WALL =     4;
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
    ORG_TYPE_CARNIVOR =         3;

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

var tpmLoop, getTpm;

(function(){
    var filterStrength = 5;
    var frameTime = 0, lastLoop = new Date, thisLoop;

    tpmLoop = function(){
      var thisFrameTime = (thisLoop=new Date) - lastLoop;
      frameTime+= (thisFrameTime - frameTime) / filterStrength;
      lastLoop = thisLoop;
    }

    getTpm = function(){
        return (1000/frameTime).toFixed(1);
    }

})();

global_tick = 0;

Colors:[]; //TODO, populate with "pretty" colors


var bytes;

var rotateoff = 22;
var rotateforward = true;

pond = {
    //variables
    stepWait:10,
    cellWall:1,
    mutationChance:200,
    flowChance:3,
    producerSpawnChance:100,
    consumerSpawnChance:20,
    resouceThreshold:40,
    singleRender:false,
    resourceSpawnChance:90,
    plantStartMoveChance:80,
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
    init:function(width,height){
        helpers.init(width,height);
        this.width = width;
        this.height = height;
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

        global_tick = 0;


        this.cx = 1-(this.height/this.width);
        this.chance = this.cx*100;

        console.log(this.cx,this.chance);

        // this.map[Math.floor(Math.random()*this.total)] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_PRODUCER,0)];
        // this.map[Math.floor(Math.random()*this.total)] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_PRODUCER,1)];
        // this.map[Math.floor(Math.random()*this.total)] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_PRODUCER,2)];

        // for(var i=0;i<50;i++){
        //     this.map[Math.floor(Math.random()*this.total)] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_PRODUCER)];
        //     this.map[Math.floor(Math.random()*this.total)] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_CONSUMER)];
        // }
        
    },
    step:function(){
        tpmLoop();
        global_tick++;
        this.processMap();
        this.pushPop();
        this.insertRandomLife();
        this.processOrgs();
        this.processMap();
        this.flowResMats();
        if(helpers.chance(5)){
            this.currentFlowDir = (this.currentFlowDir+(helpers.bool()?1:-1)).mod(8);
        }
        this.unsetWall();
        
        if(rotateforward)
            rotateoff+=1;
        else
            rotateoff-=1;

        if(rotateoff<17) rotateforward = true;
        else if(rotateoff>27) rotateforward=false;
    },
    setWall:function(){
        this.map[this.total] = [MAP_TYPE_WALL];
    },
    unsetWall:function(){
        this.map.splice(this.total,1);
    },
    insertRandomLife:function(){
        //TODO implement a threshold for life generation
        if(helpers.chance(this.producerSpawnChance)){
            var spot = Math.floor(Math.random()*this.total);
            this.map[spot] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_PRODUCER,Math.floor(Math.random()*3))];
            if(this.singleRender) this.renderOne(spot);
        }
        else if(helpers.chance(this.consumerSpawnChance)){
            var spot = Math.floor(Math.random()*this.total);
            this.map[spot] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_CONSUMER,Math.floor(Math.random()*3))];
            if(this.singleRender) this.renderOne(spot);
        }
    },
    cx:null,
    chance:null,
    getCurrentFlowDir:function(i){
        var xy = helpers.indexToCart(i);
        var x = xy[0];
        var y = xy[1];
        var cx = Math.floor(this.width/2);
        var cy = Math.floor(this.height/2);

        var dx = cx - x;
        var dy = cy - y;

        dx = dx * this.cx;

        // 1.8521739130434782
        // 24.3
        // 213
        // 115
        // 0.460093896713615


        var angle = Math.floor(((Math.atan2(dy,dx) * 180 / Math.PI)+22).mod(360)/45);
        switch(angle){
            case 0:
                    return 2;
                break;
            case 1:
                    return !helpers.percentage(this.chance)?2:0;
                break;
            case 2:
                    return 0;
                break;
            case 3:
                    return helpers.percentage(this.chance)?0:3;
                break;
            case 4:
                    return 3;
                break;
            case 5:
                    return !helpers.percentage(this.chance)?3:1;
                break;
            case 6:
                    return 1;
                break;
            case -1:
            case 7:
                    return helpers.percentage(this.chance)?1:2;
                break;
        }
    },
    flowResMats:function(){
        var listr = this.lists[MAP_TYPE_RESOURCE];
        var listm = this.lists[MAP_TYPE_MATERIAL];
        var list = listr.concat(listm);
        list.sort(function(){ return .5 - Math.random(); });

        var i,sides,t,changeDir,currentDir,canMove,c,t;
        for(var l in list){
            this.setWall();
            if(!helpers.chance(this.flowChance)) continue;
            i = list[l];
            sides = helpers.getSides(i);

            t = 0;
            changeDir = helpers.bool()?1:-1;
            currentDir = this.getCurrentFlowDir(i);
            if(helpers.chance(4)) currentDir = Math.floor(Math.random()*4);
            canMove = false;
            while(!(canMove = (this.map[sides[currentDir]][MAP_TYPE] == MAP_TYPE_EMPTY)) && t < 4){
                t++;
                currentDir = (currentDir+changeDir).mod(4);
            }
            if(!canMove) continue;
            c = this.map[i];
            t = this.map[sides[currentDir]];
            this.map[sides[currentDir]] = c;
            this.map[i] = t;
        }
    },
    pushPop:function(){
        var currentEmpty = this.currents[MAP_TYPE_EMPTY];
        var goalEmpty = Math.floor(this.total*((100-this.resouceThreshold)/100));
        if(currentEmpty < goalEmpty) return;

        var need = currentEmpty - goalEmpty;

        this.lists[MAP_TYPE_EMPTY].sort(function(){ return 0.5 - Math.random(); });
        var spot;
        for(var i=0;i<need;i++){
            spot = this.lists[MAP_TYPE_EMPTY][i];
            this.map[spot] = [MAP_TYPE_RESOURCE,this.giveRandomResource()];
            if(this.singleRender) this.renderOne(spot);
        }
    },
    processOrgs:function(){
        var list = this.lists[MAP_TYPE_ORGANISM];
        list.sort(function(){ return .5 - Math.random(); });
        var oi;
        for(i in list){
            oi = list[i];
            var o = this.map[oi][MAP_ITEM]
            o[ORG_DIDCONSUME] = false;
            o[ORG_DIDCONVERT] = false;
            this.orgEat(oi);
            this.orgInteract(oi);
            this.orgProduce(oi);
            this.orgReproduce(oi);
            this.orgExcrete(oi);
            oi = this.orgMove(oi);
            this.orgLife(oi);
        }
    },
    orgMoveChecker:function(a,desire){
        if(a > this.total){
            // TODO CHECK WHY!!!!!!!!!!! IM SO CONFUSED console.log(a);
            return false;
        }
        return (this.map[a][MAP_TYPE] == MAP_TYPE_MATERIAL && desire == this.map[a][MAP_ITEM]);
    },
    orgMove:function(i){
        var o = this.map[i][MAP_ITEM];
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER) return i;

        //var cxy = helpers.indexToCart(i);
        var domove = false;
        var ci;
        for(var d=1;d<8;d++){
            this.setWall();
            //l
                ci = helpers.getRelative(i,0,d);
                if(this.orgMoveChecker(ci,o[ORG_DESIRE])){ domove = true; var moved = 0;}
                if(!domove)
                for(var s=d;s>=0;s--){
                    if(this.orgMoveChecker(helpers.getRelative(ci,2,s),o[ORG_DESIRE]) || this.orgMoveChecker(helpers.getRelative(ci,3,s),o[ORG_DESIRE])) { domove = true; var moved = 0; break;}
                }
            //r
            if(!domove){
                ci = helpers.getRelative(i,1,d);
                if(this.orgMoveChecker(ci,o[ORG_DESIRE])){ domove = true; var moved = 1;}
                if(!domove)
                for(var s=d;s>=0;s--){
                    if(this.orgMoveChecker(helpers.getRelative(ci,2,s),o[ORG_DESIRE]) || this.orgMoveChecker(helpers.getRelative(ci,3,s),o[ORG_DESIRE])) { domove = true; var moved = 1; break;}
                }
            }
            //u
            if(!domove){
                ci = helpers.getRelative(i,2,d);
                if(this.orgMoveChecker(ci,o[ORG_DESIRE])){ domove = true; var moved = 2;}
                if(!domove)
                for(var s=d-1;s>=0;s--){
                    if(this.orgMoveChecker(helpers.getRelative(ci,0,s),o[ORG_DESIRE]) || this.orgMoveChecker(helpers.getRelative(ci,1,s),o[ORG_DESIRE])) { domove = true; var moved = 2; break;}
                }
            }
            //d
            if(!domove){
                ci = helpers.getRelative(i,3,d);
                if(this.orgMoveChecker(ci,o[ORG_DESIRE])){ domove = true; var moved = 3;}
                if(!domove)
                for(var s=d-1;s>=0;s--){
                    if(this.orgMoveChecker(helpers.getRelative(ci,0,s),o[ORG_DESIRE]) || this.orgMoveChecker(helpers.getRelative(ci,1,s),o[ORG_DESIRE])) { domove = true; var moved = 3; break;}
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
            if(this.map[sides[moved]][MAP_TYPE] != MAP_TYPE_ORGANISM && this.map[sides[moved]][MAP_TYPE] != MAP_TYPE_WALL) break;
            moved = Math.floor(Math.random()*4);
            if(cc == 3) return i;
        }
        var tmp = this.map[sides[moved]];
        this.map[sides[moved]] = this.map[i];
        this.map[i] = tmp;
        return sides[moved];
    },
    orgEat:function(i){
        var o = this.map[i][MAP_ITEM];
        
        this.setWall();

        var sides = helpers.getSides(i).sort(function(){ return 0.5 - Math.random() });
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            for(var s in sides){
                var side = sides[s];
                if(this.map[side][MAP_TYPE] != MAP_TYPE_RESOURCE || o[ORG_DESIRE] != this.map[side][MAP_ITEM]) continue;
                this.map[side] = [MAP_TYPE_EMPTY];
                o[ORG_RAWSTOR] = o[ORG_RAWSTOR]+20;
                o[ORG_DIDCONSUME] = true;
            }
        } else if(o[ORG_TYPE] == ORG_TYPE_CONSUMER){
            for(var s in sides){
                var side = sides[s];
                if(this.map[side][MAP_TYPE] != MAP_TYPE_MATERIAL || o[ORG_DESIRE] != this.map[side][MAP_ITEM]) continue;
                this.map[side] = [MAP_TYPE_EMPTY];
                o[ORG_REFINEDSTOR] = o[ORG_REFINEDSTOR]+1;
                o[ORG_DIDCONSUME] = true;
                break;
            }
        } else alert('UNKNOWN organism TYPE');

    },
    orgInteract:function(i){
        this.setWall();
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
        if(o[ORG_TYPE] != ORG_TYPE_PRODUCER  || o[ORG_DESIRE] != i[ORG_DESIRE]) return;

        if(o[ORG_RAWSTOR] > so[ORG_RAWSTOR]){
            var diff = Math.floor((o[ORG_RAWSTOR]-so[ORG_RAWSTOR])/2);
            o[ORG_RAWSTOR]-=diff;
            so[ORG_RAWSTOR]+=diff;
            so[ORG_DIDCONSUME]=true;
        }
        if(o[ORG_REFINEDSTOR] > so[ORG_REFINEDSTOR]){
            var diff = Math.floor((o[ORG_REFINEDSTOR]-so[ORG_REFINEDSTOR])/2);
            o[ORG_REFINEDSTOR]-=diff;
            so[ORG_REFINEDSTOR]+=diff;
        }

    },
    orgProduce:function(i){
        //TODO look over and improve
        var o = this.map[i][MAP_ITEM];
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER && o[ORG_RAWSTOR] > 1 && o[ORG_ATTR][ORG_ATTR_MAXSTRENGTH] - o[ORG_STRENGTH] > 10){
            o[ORG_RAWSTOR] = (o[ORG_RAWSTOR]-1);
            o[ORG_REFINEDSTOR] = (o[ORG_REFINEDSTOR]+1);
            o[ORG_DIDCONVERT]=true;
        }
        // Current dont need because consumers do not excret
        // else if(o[ORG_TYPE] == ORG_TYPE_CONSUMER && o[ORG_REFINEDSTOR] <= 0){
        //     o[ORG_REFINEDSTOR] = o[ORG_REFINEDSTOR]-1;
        //     o[ORG_RAWSTOR] = o[ORG_RAWSTOR]+1;
        //     o[ORG_DIDCONVERT]=true;
        // }
    },
    orgExcrete:function(i){
        this.setWall();
        //TODO Look over and check this.
        var o = this.map[i][MAP_ITEM];
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER && o[ORG_REFINEDSTOR] >= 20){
            var sides = helpers.getSides(i);
            sides.sort(function(){ return .5 - Math.random(); });
            for(var s in sides){
                if(this.map[sides[s]][MAP_TYPE] == MAP_TYPE_EMPTY){
                    this.map[sides[s]] = [MAP_TYPE_MATERIAL,o[ORG_DESIRE]];
                    o[ORG_REFINEDSTOR] = o[ORG_REFINEDSTOR]-20;
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
            if(o[ORG_STRENGTH] < o[ORG_ATTR][ORG_ATTR_MAXSTRENGTH]) o[ORG_STRENGTH]+=10;
        } else{
            o[ORG_STRENGTH]-=1;
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
        this.setWall();
        var o = this.map[i][MAP_ITEM];
        if(!helpers.chance(o[ORG_ATTR][ORG_ATTR_REPOCHANCE]) || o[ORG_STRENGTH] < o[ORG_ATTR][ORG_ATTR_REPOAT]) return;

        var sides = helpers.getSides(i);

        var possible = [];
        for(var s in sides) if(this.map[sides[s]][MAP_TYPE] == MAP_TYPE_EMPTY) possible.push(sides[s]);
        if(possible.length == 0) return;
        possible.sort(function(){ return 0.5 - Math.random(); });
        o[ORG_STRENGTH] = Math.floor(o[ORG_STRENGTH]*0.5);
        o[ORG_RAWSTOR] = Math.floor(o[ORG_RAWSTOR]*0.5);
        o[ORG_REFINEDSTOR] = Math.floor(o[ORG_REFINEDSTOR]*0.5);
        var newo = deepCopy(o);
        if(helpers.chance(this.mutationChance)){
            newo[ORG_ID] = this.org_id_max; this.org_id_max++;
            newo[ORG_ATTR][ORG_ATTR_REPOCHANCE]+=Math.floor(Math.random()*3)-1;
            newo[ORG_ATTR][ORG_ATTR_MOVECHANCE]+=Math.max(Math.floor(Math.random()*3)-1,1);
            newo[ORG_ATTR][ORG_ATTR_REPOAT]+=Math.floor(Math.random()*5)-2;
            newo[ORG_ATTR][ORG_ATTR_MAXSTRENGTH]+=Math.floor(Math.random()*9)-4;
            var colorDiff = 50;
            newo[ORG_CL][CL_R]=(newo[ORG_CL][CL_R]+Math.floor(Math.random()*(colorDiff*2+1))-colorDiff);
            newo[ORG_CL][CL_G]=(newo[ORG_CL][CL_G]+Math.floor(Math.random()*(colorDiff*2+1))-colorDiff);
            newo[ORG_CL][CL_B]=(newo[ORG_CL][CL_B]+Math.floor(Math.random()*(colorDiff*2+1))-colorDiff);
            if(newo[ORG_CL][CL_R]>255) newo[ORG_CL][CL_R]=255;
            if(newo[ORG_CL][CL_G]>255) newo[ORG_CL][CL_G]=255;
            if(newo[ORG_CL][CL_B]>255) newo[ORG_CL][CL_B]=255;
        }
        this.map[possible[0]] = [MAP_TYPE_ORGANISM, newo];
        if(this.singleRender) this.renderOne(possible[0]);
    },
    render:function(){
        //this.rendering = new ArrayBuffer(this.total*5);
        bytes= new Uint8Array(pond.total*4);
        var colormap = [];
        var tmp;
        for(var i=0;i<this.total;i++){
            tmp = this.renderOne(i);
            bytes[i*4]=tmp[0];
            bytes[i*4+1]=tmp[1];
            bytes[i*4+2]=tmp[2];
            bytes[i*4+3]=255;
        }
    },
    renderOne:function(i){
        switch(this.map[i][MAP_TYPE]){
            case MAP_TYPE_WALL:
            case MAP_TYPE_EMPTY:
                return [BG_COLOR[CL_R],BG_COLOR[CL_G],BG_COLOR[CL_B]];
                break;
            case MAP_TYPE_RESOURCE:
                var color = this.resources[this.map[i][MAP_ITEM]];
                return [color[CL_R],color[CL_G],color[CL_B]];
                break;
            case MAP_TYPE_MATERIAL:
                var color = this.materials[this.map[i][MAP_ITEM]];
                if(color.length < 3) console.log(i,this.map[i],color);
                return [color[CL_R],color[CL_G],color[CL_B]];
                break;
            case MAP_TYPE_ORGANISM:
                var color = this.map[i][MAP_ITEM][ORG_CL];
                return [color[CL_R],color[CL_G],color[CL_B]];
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
        this.unsetWall();
        this.clearListsCounts();
        for(var i in this.map){
            if(this.map[i][MAP_TYPE] == MAP_TYPE_WALL) this.map[i][MAP_TYPE] = this.map[i][MAP_TYPE_EMPTY];
            if([MAP_TYPE] == MAP_TYPE_WALL) console.log(i,this.map[i][MAP_TYPE]);
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
    makeRandomOrganism:function(type,desire){
        //TODO make organisms a little more random from the get
        var o = [];
        o[ORG_ID] = this.org_id_max; this.org_id_max++;
        o[ORG_TYPE] = type;
        o[ORG_DESIRE] = desire;
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            o[ORG_CL] = [51,255,51];
        } else {
            o[ORG_CL] = [255,51,51]
        }
        o[ORG_RAWSTOR] = 0;
        o[ORG_REFINEDSTOR] = 0;
        o[ORG_STRENGTH] = 50;
        o[ORG_DIDCONSUME] = false;
        o[ORG_DEMEANOR] = ORG_DEMEANOR_HELPFUL;
        o[ORG_ATTR] = [];
        o[ORG_ATTR][ORG_ATTR_REPOCHANCE] = 2;
        o[ORG_ATTR][ORG_ATTR_REPOAT] = 100;
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
    lists:[],
    rendering:[],
    currentFlowDir:0
}

function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = deepCopy(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = deepCopy(obj[i]);
        }
        return out;
    }
    return obj;
}