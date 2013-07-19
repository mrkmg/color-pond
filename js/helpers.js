Number.prototype.mod = function(n) { return ((this%n)+n)%n; }
helpers = {
    width:null,
    height:null,
    total:null,
    wrapAround:false,
    init:function(width,height){
        this.width = width;
        this.height = height;
        this.total = width*height;
        console.log(this.total);
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

        if(this.wrapAround){
            l = (i.mod(this.width) == 0)?i+this.width-1:(i-1);
            r = (i.mod(this.width) == this.width-1)?i-this.width+1:(i+1);
            u = (i+this.width).mod(this.total);
            d = (i-this.width).mod(this.total);
        } else {
            l = (i.mod(this.width) == 0)?this.total:(i-1);
            r = (i.mod(this.width) == this.width-1)?this.total:(i+1);
            u = (i+this.width);
            d = (i-this.width);
            u = u>this.total?this.total:u;
            d = d<0?this.total:d;
        }
        return [l,r,u,d];
    },
    getRelative:function(i,d,l){
        if(this.wrapAround){
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
        } else {
            switch(d){
                case 0:
                    return (i.mod(this.width)-l<0)?this.total:(i-l);
                    break;
                case 1:
                    return (i.mod(this.width)+l>this.width-1)?this.total:(i+l);
                    break;
                case 2:
                    var up = (i+(this.width*l));
                    return up>this.total?this.total:up;
                    break;
                case 3:
                    var dw = (i-(this.width*l));
                    return dw<0?this.total:dw;
                    break;
            }
        }
    },
    bool:function(){
        return Math.floor(Math.random()*2)===1;
    },
    chance:function(odd){
        return Math.floor(Math.random()*odd)===0;
    },
    percentage:function(pc){
        return Math.random()*100 > pc;
    }
}