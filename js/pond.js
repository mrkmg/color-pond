/**NOTES
 *  pond map 2d xy array of 2element array
 *      0 is type: 0 = empty,1 = resource, 2 = material, 3 = organism
 *      1 is offset of item
 *
 * organism array
 *      0 is type: 0:producer,1:consumer
 *      1 is material
 *       2 is colorarray
 *
 */
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

MAT_RES =   0;
MAT_CL =    1;

ORG_ID =           0;
ORG_TYPE =         1;
ORG_MAT =          2;
ORG_CL =           3;
ORG_RAWSTOR =      4;
ORG_REFINEDSTOR =  5;
ORG_STRENGTH =     6;
ORG_DIDCONSUME =   7;
ORG_DEMEANOR =     8;
ORG_ATTR =          9;

    ORG_TYPE_PRODUCER =         0;
    ORG_TYPE_CONSUMER =         1;

    ORG_DEMEANOR_HELPFUL =      0;
    ORG_DEMEANOR_PASSIVE =      1;
    ORG_DEMEANOR_AGGRESSIVE =   2;

    ORG_ATTR_REPOCHANCE = 0;
    ORG_ATTR_REPOAT = 1;
    ORG_ATTR_MAXSTRENGTH = 2;
    ORG_ATTR_MOVECHANCE = 3;




BG_COLOR = [60,60,60];

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
    flowChance:3,
    producerSpawnChance:20,
    consumerSpawnChance:10,
    resouceThreshold:80,
    singleRender:false,
    resourceSpawnChance:40,
    bulkOdd:1,
    width:5,
    height:5,
    resources:{
        oxogen:[0,51,102],
        carben:[0,0,102],
        hydrogen:[51,0,102],
        //iron:[40,60,60],
        /*argon:[60,60,40],
        helium:[60,60,60],*/
    },
    materials:{
        hydrocarben:[['hydrogen','carben'],[0,128,255]],
        carbox:[['carben','oxogen'],[0,0,255]],
        oxydro:[['oxogen','hydrogen'],[127,0,255]],
        /*irogen:[['iron','hydrogen'],[80,100,120]],
        rust:[['oxogen','iron'],[120,100,80]],
        caron:[['carben','iron'],[80,120,100]],*/

        /*heligon:[['helium','argon'],[120,100,80]],
        arion:[['argon','iron'],[100,120,80]],
        helion:[['helium','iron'],[80,100,120]],*/
    },

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
    },
    step:function(){
        gameLoopTick();
        global_tick++;
        this.processMap();
        this.pushPop();
        this.processMap();
        this.insertRandomLife();
        this.processOrgs();
        this.flowResMats();
        if(!this.singleRender && global_tick.mod(this.bulkOdd)==0){
            this.render();
        }
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
        var list = this.lists[MAP_TYPE_RESOURCE].concat(MAP_TYPE_MATERIAL);
        list.sort(function(){ return .5 - Math.random(); });
        for(var l in list){
            if(!helpers.chance(this.flowChance)) continue;
            var i = list[l];
            var sides = helpers.getSides(i);
            var isMatch = false;
            for(var s in sides){
                var side = sides[s];
                if(this.map[i][MAP_TYPE] == this.map[side][MAP_TYPE] &&
                   this.map[i][MAP_ITEM] == this.map[side][MAP_ITEM]) isMatch = true;
            }
            if(isMatch && helpers.bool()) continue;
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
        
        if((this.currents[MAP_TYPE_RESOURCE]/this.total)*100 > this.resouceThreshold) return;

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
            this.orgEat(oi);
            this.orgProduce(oi)
            this.orgInteract(oi);
            this.orgMove(oi);
        }
        var list = [];
        for(var i in this.map){
            if(this.map[i][MAP_TYPE] == MAP_TYPE_ORGANISM) list.push(parseInt(i));
        }
        list.sort(function(){ return .5 - Math.random(); });
        for(i in list){
            var oi = list[i];
            this.orgReproduce(oi);
            this.orgExcrete(oi);
            this.orgLife(oi);
        }
    },
    orgMove:function(i){
        //TODO IMPROVE - DONT KNOW HOW BUT NEED TO!!!!
        var o = this.map[i][MAP_ITEM];
        if(this.map[i][MAP_ITEM][ORG_TYPE] == ORG_TYPE_PRODUCER){
            return;
            if(!helpers.chance(o[ORG_ATTR][ORG_ATTR_MOVECHANCE])) return;
            var sides = helpers.getSides(i);
            sides.sort(function(){ return 0.5 - Math.random(); });
            if(this.map[sides[0]][MAP_TYPE] == MAP_TYPE_ORGANISM) return;
            var tmp = this.map[sides[0]];
            this.map[sides[0]] = this.map[i];
            this.map[i] = tmp;
            if(this.singleRender){
                this.renderOne(i);
                this.renderOne(sides[0]);
            }
        } else {
            var cxy = helpers.indexToCart(i);
            var domove = false;
            var checker = function(a){
                return pond.map[a][MAP_TYPE] == MAP_TYPE_MATERIAL && o[ORG_MAT] == pond.map[a][MAP_ITEM];
            }
            for(var d=1;d<5;d++){
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
                if(cc == 3) return;
            }
            var tmp = this.map[sides[moved]];
            this.map[sides[moved]] = this.map[i];
            this.map[i] = tmp;
            if(this.singleRender){
                this.renderOne(i);
                this.renderOne(sides[moved]);
            }
        }
    },
    orgEat:function(i){
        var o = this.map[i][MAP_ITEM];
        var mat = this.materials[o[ORG_MAT]][MAT_RES];

        var sides = helpers.getSides(i);
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            for(var s in sides){
                var side = sides[s];
                if(this.map[side][MAP_TYPE] != MAP_TYPE_RESOURCE) continue;
                var res = mat.indexOf(this.map[side][MAP_ITEM]);
                if(res == -1) continue;
                if(o[ORG_RAWSTOR][res] > 5) continue;
                this.map[side] = [MAP_TYPE_EMPTY];
                if(this.singleRender) this.renderOne(side);
                o[ORG_RAWSTOR][res]++;
                o[ORG_DIDCONSUME] = true;
                break;
            }
        } else if(o[ORG_TYPE] = ORG_TYPE_CONSUMER){
            for(var s in sides){
                var side = sides[s];
                if(this.map[side][MAP_TYPE] != MAP_TYPE_MATERIAL) continue;
                if(o[ORG_MAT] != this.map[side][MAP_ITEM]) continue;
                //if(o[ORG_REFINEDSTOR] > 5) continue;
                this.map[side] = [MAP_TYPE_EMPTY];
                if(this.singleRender) this.renderOne(side);
                o[ORG_REFINEDSTOR]++;
                o[ORG_DIDCONSUME] = true;
            }
        } else alert('UNKNOWN organism TYPE');

    },
    orgInteract:function(i){
        //TODO Implement Passive and Aggressive interactions
        // return;
        o = this.map[i][MAP_ITEM];
        sides = helpers.getSides(i);
        sides.sort(function(){ return 0.5 - Math.random(); });
        for(var s in sides) if(this.map[sides[s]][MAP_TYPE] == MAP_TYPE_ORGANISM){
            so = this.map[sides[s]];
            var demeanor = o[ORG_DEMEANOR];
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
        //TODO Implement more sharing ( Consumers<->Consumers & Producers<->Consumers)
        if(o[ORG_TYPE] != ORG_TYPE_PRODUCER && so[ORG_TYPE] != ORG_TYPE_PRODUCER) return;
        if(so[ORG_TYPE] == ORG_TYPE_PRODUCER){
            for(var omi in this.materials[o[ORG_MAT]]){
                var mat = this.materials[o[ORG_MAT]][omi];
                var somi = this.materials[so[ORG_MAT]].indexOf(mat);
                if(res_i == -1) continue;
                if(o[ORG_RAWSTOR][omi] - so[ORG_RAWSTOR][somi] >= 2){
                    o[ORG_RAWSTOR][omi]--;
                    so[ORG_RAWSTOR][somi]++;
                    so[ORG_DIDCONSUME]=true;
                }
            }
        } else {
            if(o[ORG_REFINEDSTOR] - so[ORG_REFINEDSTOR] >= 2){
                o[ORG_REFINEDSTOR]--;
                so[ORG_REFINEDSTOR]++;
                so[ORG_DIDCONSUME]=true;
            }
        }
    },
    orgProduce:function(i){
        //TODO look over and improve
        var o = this.map[i][MAP_ITEM];
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            var do_produce = true;
            for(var sto in o[ORG_RAWSTOR]) if(o[ORG_RAWSTOR][sto] == 0){
                do_produce=false;
                break;
            }
            if(do_produce){
                for(var sto in o[ORG_RAWSTOR]) o[ORG_RAWSTOR][sto]--;
                o[ORG_REFINEDSTOR]++;
            }
        } else if(o[ORG_TYPE] == ORG_TYPE_CONSUMER){
            if(o[ORG_REFINEDSTOR] > 2){
                o[ORG_REFINEDSTOR]--;
                for(var s in o[ORG_RAWSTOR]){
                    o[ORG_RAWSTOR][s]++;
                }
            }
        } else alert('UNKNOWN organism TYPE');
    },
    orgExcrete:function(i){
        //TODO Look over and check this.
        var o = this.map[i][MAP_ITEM];
        var mat = this.materials[o[ORG_MAT]][MAT_RES];

        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER && o[ORG_REFINEDSTOR] > 0){
            var sides = helpers.getSides(i);
            sides.sort(function(){ return .5 - Math.random(); });
            for(var s in sides){
                if(this.map[sides[s]][MAP_TYPE] == MAP_TYPE_EMPTY){
                    this.map[sides[s]] = [MAP_TYPE_MATERIAL,o[ORG_MAT]];
                    if(this.singleRender) this.renderOne(sides[s]);
                    o[ORG_REFINEDSTOR]--;
                    break;
                }
            }
        } else if(o[ORG_TYPE] == ORG_TYPE_CONSUMER){
            var sides = helpers.getSides(i);
            sides.sort(function(){ return 0.5 - Math.random(); });
            var didPlace = false;
            for(var s in sides){
                var side = sides[s];
                if(this.map[side][MAP_TYPE] == MAP_TYPE_EMPTY){
                    if(o[ORG_RAWSTOR][0] > 0) {
                        if(o[ORG_RAWSTOR][1]){
                            if(helpers.bool()){
                                this.map[side] = [MAP_TYPE_RESOURCE,this.materials[o[ORG_MAT]][MAT_RES][0]];
                                o[ORG_RAWSTOR][0]--;
                            } else {
                                this.map[side] = [MAP_TYPE_RESOURCE,this.materials[o[ORG_MAT]][MAT_RES][1]];
                                o[ORG_RAWSTOR][1]--;
                            }
                        } else {
                            this.map[side] = [MAP_TYPE_RESOURCE,this.materials[o[ORG_MAT]][MAT_RES][1]];
                            o[ORG_RAWSTOR][1]--;
                        }
                        didPlace = true;
                    } else if(o[ORG_RAWSTOR][1]){
                        didPlace = true;
                    }
                }
                if(!didPlace) break;
            }
        }
    },
    orgLife:function(i){
        var o = this.map[i][MAP_ITEM];
        if(o[ORG_DIDCONSUME]){
            if(o[ORG_STRENGTH] < o[ORG_ATTR][ORG_ATTR_MAXSTRENGTH]) o[ORG_STRENGTH]+=10;
        } else {
            if(o[ORG_STRENGTH] < 20 && o[ORG_STRENGTH] > 0){
                var sides = helpers.getSides(i);
                sides.sort(function(){ return 0.5 - Math.random(); });
                var starved = true;
                for(var s in sides){
                    side = sides[s];
                    if( this.map[side][MAP_TYPE] == MAP_TYPE_ORGANISM &&
                        this.map[side][MAP_ITEM][ORG_ID] == o[ORG_ID] &&
                        this.map[side][MAP_ITEM][ORG_STRENGTH] > 30 ){
                            o[ORG_STRENGTH]++;
                            this.map[side][MAP_ITEM][ORG_STRENGTH]--;
                            starved = false;
                            break;
                    }
                }
                if(starved) o[ORG_STRENGTH]-=2;
            }
            else if(o[ORG_STRENGTH] < 1) {
                this.map[i] = [MAP_TYPE_EMPTY];
                if(this.singleRender) this.renderOne(i);
            } else {
                o[ORG_STRENGTH]-=2;
            }
        }
    },
    orgReproduce:function(i){
        var o = this.map[i][MAP_ITEM];
        if(helpers.chance(o[ORG_ATTR][ORG_ATTR_REPOCHANCE]) && o[ORG_STRENGTH] > o[ORG_ATTR][ORG_ATTR_REPOAT]){
            var sides = helpers.getSides(i);
            sides.sort(function(){ return .5 - Math.random(); });
            for(var s in sides){
                var side = sides[s];

                if(this.map[side][MAP_TYPE] == MAP_TYPE_EMPTY){
                    var newo = jQuery.extend(true,[],o);
                    o[ORG_STRENGTH]-=10;
                    newo[ORG_STRENGTH]-=10;
                    newo[ORG_RAWSTOR] = [0,0];
                    newo[ORG_REFINEDSTOR] = 0;
                    if(helpers.chance(this.mutationChance)){
                        newo[ORG_ID] = this.org_id_max; this.org_id_max++;
                        newo[ORG_ATTR][ORG_ATTR_REPOCHANCE]+=Math.floor(Math.random()*3)-1;
                        newo[ORG_ATTR][ORG_ATTR_MOVECHANCE]+=Math.floor(Math.random()*3)-1;
                        newo[ORG_ATTR][ORG_ATTR_REPOAT]+=Math.floor(Math.random()*5)-2;
                        newo[ORG_ATTR][ORG_ATTR_MAXSTRENGTH]+=Math.floor(Math.random()*9)-4;
                        if(o[ORG_TYPE]!=ORG_TYPE_CONSUMER) newo[ORG_CL][CL_R]=(newo[ORG_CL][CL_R]+Math.floor(Math.random()*61)-30).mod(200);
                        if(o[ORG_TYPE]!=ORG_TYPE_PRODUCER) newo[ORG_CL][CL_G]=(newo[ORG_CL][CL_G]+Math.floor(Math.random()*61)-30).mod(200);
                        newo[ORG_CL][CL_B]=(newo[ORG_CL][CL_B]+Math.floor(Math.random()*61)-30).mod(200);
                    }
                    this.map[side] = [MAP_TYPE_ORGANISM, newo];
                    if(this.singleRender) this.renderOne(side);
                    break;
                }
            }
        }
    },
    render:function(){
        for(var i=0;i<this.total;i++){
            this.renderOne(i);
        }
        draw.render();
        gameLoopFrame();
    },
    renderOne:function(i){
        switch(this.map[i][0]){
            case 0:
                draw.point(i,BG_COLOR[CL_R],BG_COLOR[CL_G],BG_COLOR[CL_B]);
                break;
            case 1:
                var color = this.resources[this.map[i][MAP_ITEM]];
                draw.point(i,color[CL_R],color[CL_G],color[CL_B])
                break;
            case 2:
                var color = this.materials[this.map[i][MAP_ITEM]][MAT_CL];
                draw.point(i,color[CL_R],color[CL_G],color[CL_B]);
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
        o[ORG_MAT] = this.giveRandomMaterial();
        if(o[ORG_TYPE] == ORG_TYPE_PRODUCER){
            o[ORG_CL] = [51,255,51];
        } else {
            o[ORG_CL] = [255,51,51]
        }
        o[ORG_RAWSTOR] = [0,0];
        o[ORG_REFINEDSTOR] = 0;
        o[ORG_STRENGTH] = 50;
        o[ORG_DIDCONSUME] = false;
        o[ORG_DEMEANOR] = helpers.bool()?ORG_DEMEANOR_HELPFUL:ORG_DEMEANOR_PASSIVE;
        o[ORG_ATTR] = [];
        o[ORG_ATTR][ORG_ATTR_REPOCHANCE] = 3;
        o[ORG_ATTR][ORG_ATTR_REPOAT] = 80;
        o[ORG_ATTR][ORG_ATTR_MAXSTRENGTH] = 200;
        o[ORG_ATTR][ORG_ATTR_MOVECHANCE] = o[ORG_TYPE]==ORG_TYPE_PRODUCER?20:2;
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