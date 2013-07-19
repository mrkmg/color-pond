$(document).ready(function(){
    $('.no_initial').hide();

        worker.addEventListener('message',function(e){
            var value = e.data.value;
            switch(e.data.type){
                case 'cmap':
                    if(!rendering) return;
                    rendering = true;
                    draw.render(value);
                    setTimeout(function(){ request('cmap'); },50);
                    break;
                case 'type':
                    $('#'+value.option).val(value.value)
                    break;
                case 'time':
                    var a =  new Date().getTime();
                    console.log(a);
                    break;
                case 'stats':
                    $('.tps').text(value[0]+' tps');
                    $('.frame').text('frame '+value[1]);
                    $('.pEmpty').text(value[2][0]+' E');
                    $('.pRes').text(value[2][1]+' R');
                    $('.pMat').text(value[2][2]+' C');
                    $('.pOrg').text(value[2][3]+' O');
                    break;
                case 'getItem':
                    console.log(value);
                    break;
                case 'log':
                case 'error':
                    console.log(value);
                    break;
                default:
                    console.log(e.data);
                    break;
            }
        });

        var rendering = false;

        function start(){
            rendering = true;
            request('start');
            request('cmap');
            updateInfo();
        }

        function stop(){
            rendering = false;
            request('stop');
        }

        function updateInfo(){
            request('stats');
            $('.fps').text(getFps()+' fps');
            if(rendering)
                setTimeout(updateInfo,1000);
        }

        request('getOption','flowChance');
        request('getOption','producerSpawnChance');
        request('getOption','consumerSpawnChance');
        request('getOption','mutationChance');
        request('getOption','resourceSpawnChance');
        request('getOption','resouceThreshold');
        request('getOption','plantStartMoveChance');
        request('getOption','bulkOdd');
        request('getOption','stepWait');
        request('getOption','cellWall');

        $('#prefilter').val(draw.prefilter);
        $('#prefilter').change(function(ev){
            draw.prefilter = $(this).val();
        });
        $('#postfilter').val(draw.postfilter);
        $('#postfilter').change(function(ev){
            draw.postfilter = $(this).val();
        });

        $('#pauserun').click(function(){
            if(rendering) stop();
            else start();
        });

        var screenX = $('html').width()-350;
        var screenY = $('html').height()-150;

        var ideal = 25000;
        if(screenX > screenY){
            var s1 = Math.round((screenX/screenY)*100)/100;
            var s2 = Math.floor(ideal/s1);
            var s3 = Math.floor(Math.sqrt(s2));
            var dx = Math.floor(s1*s3);
            var dy = s3;
        } else {
            var s1 = Math.round((screenY/screenX)*100)/100;
            var s2 = Math.floor(ideal/s1);
            var s3 = Math.floor(Math.sqrt(s2));
            var dy = Math.floor(s1*s3);
            var dx = s3;
        }

        $('#width').val(dx);
        $('#height').val(dy);

        $('#totalarea').text(parseInt($('#height').val())*parseInt($('#width').val()));

        var bestfit = true;

        $('#bestfit').click(function(){
            bestfit = !bestfit;
            if(bestfit) $(this).attr('checked','checked');
            else       $(this).removeAttr('checked');
        });

        $('#height').change(function(){
            if(bestfit){
                $('#width').val(Math.floor(dx*(parseInt($(this).val())/dy)));
            }
            $('#totalarea').text(parseInt($('#height').val())*parseInt($('#width').val()));
        });
        $('#width').change(function(){
            if(bestfit){
                $('#height').val(Math.floor(dy*(parseInt($(this).val())/dx)));
            }
            $('#totalarea').text(parseInt($('#height').val())*parseInt($('#width').val()));
        });

        $('#cellWall, #flowChance, #producerSpawnChance, #consumerSpawnChance, #mutationChance, #resourceSpawnChance, #resouceThreshold, #plantStartMoveChance, #bulkOdd, #stepWait').change(function(){
            var id = $(this).attr('id');
            request('setOption',{option:id,value:$(this).val()});
        });

        $('#doinit').click(function(){
            if($('#seed').val() != '')
                request('seed',$('#seed').val());

            width = parseInt($('#width').val());
            height = parseInt($('#height').val());
            request('init',{width:width,height:height});
            draw.init(width,height);
            helpers.init(width,height);
            $('#pondHolder').width(250 + $('#pond').width());
            $('.no_initial').show();
            $('.intial_only').hide();
            start();
        });

        var mousePosX = -1;
        var mousePosY = -1;

        $('#pond').mouseout(function(){
            mousePosX = -1;
            mousePosY = -1;
        }).mousemove(function(ev){
            mousePosX = Math.floor((ev.offsetX-5)/draw.scale);
            mousePosY = Math.floor((ev.offsetY-5)/draw.scale);
        });

        setInterval(function(){
            if(mousePosX != -1 && mousePosY != -1){
                console.log(helpers.cartToIndex(mousePosX,mousePosY));
                request('getItem',helpers.cartToIndex(mousePosX,mousePosY));
            }
        },1000);
});