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