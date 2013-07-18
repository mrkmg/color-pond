//Webworker

importScripts('helpers.js');
importScripts('randomseed.js');

self.addEventListener('message', function(e) {
  var data = e.data.data;
  switch (e.data.cmd) {
    case 'seed':
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
        report('cmap',pond.rendering);
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


var TPS_filterStrength = 5;
var TPS_frameTime = 0, TPS_lastLoop = new Date, TPS_thisLoop;

function gameLoopTick(){
  var TPS_thisFrameTime = (TPS_thisLoop=new Date) - TPS_lastLoop;
  TPS_frameTime+= (TPS_thisFrameTime - TPS_frameTime) / TPS_filterStrength;
  TPS_lastLoop = TPS_thisLoop;
}

global_tick = 0;

Colors:[]; //TODO, populate with "pretty" colors

pond = {
    //variables
    stepWait:10,
    cellWall:1,
    mutationChance:20,
    flowChance:1,
    producerSpawnChance:50,
    consumerSpawnChance:50,
    resouceThreshold:60,
    singleRender:false,
    resourceSpawnChance:120,
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

        // for(var i=0;i<50;i++){
        //     this.map[Math.floor(Math.random()*this.total)] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_PRODUCER)];
        //     this.map[Math.floor(Math.random()*this.total)] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_CONSUMER)];
        // }
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
        return this.render();
    },
    insertRandomLife:function(){
        //TODO implement a threshold for life generation
        if(helpers.chance(this.producerSpawnChance)){
            var spot = Math.floor(Math.random()*this.total);
            this.map[spot] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_PRODUCER)];
            if(this.singleRender) this.renderOne(spot);
        }
        else if(helpers.chance(this.consumerSpawnChance)){
            var spot = Math.floor(Math.random()*this.total);
            this.map[spot] = [MAP_TYPE_ORGANISM,this.makeRandomOrganism(ORG_TYPE_CONSUMER)];
            if(this.singleRender) this.renderOne(spot);
        }
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
            // for(var s in sides){
            //     var side = sides[s];
            //     if(this.map[i][MAP_TYPE] == this.map[side][MAP_TYPE] &&
            //        this.map[i][MAP_ITEM] == this.map[side][MAP_ITEM]) matches++;
            // }
            // if(!helpers.chance(matches*4)) continue;
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
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER) return i;
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER && !helpers.chance(o[ORG_ATTR][ORG_ATTR_MOVECHANCE])) return i;

        var cxy = helpers.indexToCart(i);
        var domove = false;
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            if(o[ORG_DIDCONVERT]){
                var sides = helpers.getSides(i);
                for(var s in sides) if(this.map[s][MAP_TYPE] == MAP_TYPE_ORGANISM && this.map[s][MAP_ITEM][ORG_ID] == o[ORG_ID]) return i;
                var checker = function(a){ return (pond.map[a][MAP_TYPE] == MAP_TYPE_ORGANISM && o[ORG_ID] == pond.map[a][MAP_ITEM][ORG_ID]); }
            }
            else{
                var checker = function(a){ return
                    (pond.map[a][MAP_TYPE] == MAP_TYPE_RESOURCE && o[ORG_DESIRE] == pond.map[a][MAP_ITEM]) ||
                    (pond.map[a][MAP_TYPE] == MAP_TYPE_ORGANISM && o[ORG_ID] == pond.map[a][MAP_ITEM][ORG_ID] && o[ORG_RAWSTOR] > 0); }
            }
        } else {
            var checker = function(a){ return (pond.map[a][MAP_TYPE] == MAP_TYPE_MATERIAL && o[ORG_DESIRE] == pond.map[a][MAP_ITEM]); }
        }

        for(var d=1;d<8;d++){
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
                o[ORG_RAWSTOR]+=5;
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
        if(o[ORG_TYPE] != ORG_TYPE_PRODUCER || o[ORG_ID] != i[ORG_ID] || o[ORG_RAWSTOR] < so[ORG_RAWSTOR]+1) return;
        o[ORG_RAWSTOR]+=2;
        so[ORG_RAWSTOR]-=2;

    },
    orgProduce:function(i){
        //TODO look over and improve
        var o = this.map[i][MAP_ITEM];
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            if(o[ORG_RAWSTOR] <= 0) return;
            o[ORG_RAWSTOR]--;
            o[ORG_REFINEDSTOR]+=.2;
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
        var o = this.map[i][MAP_ITEM];
        if(!helpers.chance(o[ORG_ATTR][ORG_ATTR_REPOCHANCE]) || o[ORG_STRENGTH] < o[ORG_ATTR][ORG_ATTR_REPOAT]) return;

        var sides = helpers.getSides(i);

        var possible = [];
        for(var s in sides) if(this.map[sides[s]][MAP_TYPE] == MAP_TYPE_EMPTY) possible.push(sides[s]);
        if(possible.length == 0) return;
        possible.sort(function(){ return 0.5 - Math.random(); });
        o[ORG_STRENGTH] = Math.ceil(o[ORG_STRENGTH]*0.5);
        o[ORG_RAWSTOR] = Math.floor(o[ORG_RAWSTOR]/2);
        o[ORG_REFINEDSTOR] = Math.floor(o[ORG_REFINEDSTOR]/2);
        var newo = deepCopy(o);
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
        //this.rendering = new ArrayBuffer(this.total*5);
        var colormap = [];
        for(var i=0;i<this.total;i++){
            colormap[i] = this.renderOne(i);
        }
        this.rendering = colormap;
    },
    renderOne:function(i){
        switch(this.map[i][MAP_TYPE]){
            case MAP_TYPE_EMPTY:
                return [BG_COLOR[CL_R],BG_COLOR[CL_G],BG_COLOR[CL_B],0];
                break;
            case MAP_TYPE_RESOURCE:
                var color = this.resources[this.map[i][MAP_ITEM]];
                return [color[CL_R],color[CL_G],color[CL_B],0];
                break;
            case MAP_TYPE_MATERIAL:
                var color = this.materials[this.map[i][MAP_ITEM]];
                return [color[CL_R],color[CL_G],color[CL_B],0];
                break;
            case MAP_TYPE_ORGANISM:
                var color = this.map[i][MAP_ITEM][ORG_CL];
                return [color[CL_R],color[CL_G],color[CL_B],this.cellWall];
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
    rendering:[]
}

function deepCopy(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        var out = [], i = 0, len = obj.length;
        for ( ; i < len; i++ ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    if (typeof obj === 'object') {
        var out = {}, i;
        for ( i in obj ) {
            out[i] = arguments.callee(obj[i]);
        }
        return out;
    }
    return obj;
}