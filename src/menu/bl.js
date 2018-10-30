export {InitBucketList,OpenBucketList,CloseBucketList,buckList};
import {bl_filter} from '../layers/layers.js'
import {SetCurPosition} from "../location/geolocation";

var buckList = $.makeArray();
function InitBucketList() {

    var temp = JSON.parse(localStorage.getItem("favourites"));
    if(temp) {
        if(!Array.isArray(temp))
            temp = JSON.parse(temp);
        buckList = buckList.concat(temp);
    }else{
        buckList[0] = {'up_date':JSON.stringify($.now())};
        localStorage.setItem("favourites", JSON.stringify(buckList));
    }

};



function AddToFavourites(id) {

    if (id) {
        var obj = localStorage.getItem(id);
        if (buckList.indexOf(id) === -1){
            buckList[0] = {'up_date': $.now()};
            buckList.push(id);
            localStorage.setItem("favourites", JSON.stringify(buckList));

            if($('#container').hasScrollBar()){
                $('#panel').css('pointer-events','initial');
            }
        }
    }
}
//["{\"category\":\"8\",\"owner\":\"wikipedia\",\"type\":\"4\",\"filename\":\"55.74213_37.695484\",\"hash\":\"zRLyaJ7ZL9obL/lZIcU1Aw\",\"caption\":\"<a href='#'  onclick=\\\"OpenNewWindow('https://ru.m.wikipedia.org/wiki/Взрыв свитского поезда под Москвой (1879)','Взрыв свитского поезда под Москвой (1879)');\\\">Взрыв свитского поезда под Москвой (1879)</a>\",\"title\":\"Взрыв свитского поезда под Москвой (1879)\",\"lon\":37.695484,\"lat\":55.74213,\"ambit\":50,\"status\":2,\"url\":\"https://ru.m.wikipedia.org/wiki/Взрыв свитского поезда под Москвой (1879)\",\"scale\":0.3,\"logo_id\":\"ic_8\",\"func\":\"InsertIFrame\"}","{\"category\":\"8\",\"owner\":\"wikipedia\",\"type\":\"4\",\"filename\":\"55.736388888889_37.7103\",\"hash\":\"HJGLIq7iDCz7gEjqruz8sA\",\"caption\":\"<a href='#'  onclick=\\\"OpenNewWindow('https://ru.m.wikipedia.org/wiki/Смирновская улица (Москва)','Смирновская улица (Москва)');\\\">Смирновская улица (Москва)</a>\",\"title\":\"Смирновская улица (Москва)\",\"lon\":37.7103,\"lat\":55.736388888889,\"ambit\":50,\"status\":2,\"url\":\"https://ru.m.wikipedia.org/wiki/Смирновская улица (Москва)\",\"scale\":0.3,\"logo_id\":\"ic_8\",\"func\":\"InsertIFrame\"}","{\"category\":\"8\",\"owner\":\"wikipedia\",\"type\":\"4\",\"filename\":\"55.740361111111_37.6875\",\"hash\":\"WzvDFYkSIY/OZYHAuO4NFQ\",\"caption\":\"<a href='#'  onclick=\\\"OpenNewWindow('https://ru.m.wikipedia.org/wiki/Новорогожская улица','Новорогожская улица');\\\">Новорогожская улица</a>\",\"title\":\"Новорогожская улица\",\"lon\":37.6875,\"lat\":55.740361111111,\"ambit\":50,\"status\":2,\"url\":\"https://ru.m.wikipedia.org/wiki/Новорогожская улица\",\"scale\":0.3,\"logo_id\":\"ic_8\",\"func\":\"InsertIFrame\"}"]
function OpenBucketList(){

    $("#panel_title").find('h2').text('Bucket List');

    if(!$('#panel').is(':visible')) {

        BuildBucketList();

        setTimeout(function () {

            if($('#container').hasScrollBar()){
                $('#panel').css('pointer-events','initial');
            }else{
                $('#panel').css('pointer-events','none');/*non-clickable*/
            }
        },100);

        bl_filter = true;
        ol_map.dispatchEvent('change');
        //Map.renderSync();
        //Map.render();

        $("#panel").animate({width: 'toggle'}, 300);

        if($('#menu_items').is(':visible'))
            $('#menu_items').slideToggle('slow',function () {

            });
    }else{

        CloseBucketList();
    }
}

function CloseBucketList() {
    if($('#panel').is(':visible')) {
        bl_filter = false;
        $('#container').empty();
        $("#panel").animate({width: 'toggle'}, 300);
    }
}

function BuildBucketList() {

    $('#panel').find('img').attr('src',"./images/ic_favorite.png");

    $('#container').empty();

    var cnt = 0;

    for(var i in buckList) {

        var item = buckList[i];
        if (!item || item.up_date)//without [0]
            continue;
        var obj = JSON.parse(localStorage.getItem(item));
        var item = $('.item').eq(0);
        var newDiv = $(item).clone();
        newDiv.css('display', 'block');
        newDiv.appendTo($('#container'));
        var logo = $(newDiv).find(".logo").eq(0);
        var text_1 = $(newDiv).find(".text_1").eq(0);

        var checked = $(newDiv).find(".checked").eq(0);
        logo.attr('src', (obj.logo_id?localStorage.getItem(obj.logo_id):localStorage.getItem("ic_"+obj.category)));
        if (obj.status!=='9'){
            checked.attr('src', "./images/ic_stop.png");
            checked.attr('hash',obj.hash);
            checked.on('click', function(){
                RemoveFromList($(this).attr('hash'));
            })
        }else if(obj.status =='9'){
            checked.attr('src', "../menu/images/ic_check.png");
        }

        logo.attr('data-obj', buckList[i]);
        text_1.html("<a href='#'  onclick=OpenNewWindow('"+obj.url+"','"+obj.title+"');>"+obj.title+"</a>");
        var text_2 = $(newDiv).find(".text_2").eq(0);
        text_2.text(obj.owner);
        cnt++;
    }

    $('#cnt').css('visibility', 'visible');
    $('#cnt').text("("+cnt+")");

    return true;
}

function OnClickBucketListLogo(el) {
    var hash = $(el).attr('data-obj');
    var obj = JSON.parse(localStorage.getItem(hash));
    var coordinates = ol.proj.fromLonLat([obj.longitude,obj.latitude] );
    SetCurPosition(coordinates)
}

function RemoveFromList(id){

    var res = $.grep(buckList, function(it,i){
        //var item = JSON.parse(it);
        return it === id;
    });
    if (res.length > 0) {
        buckList.splice(buckList.indexOf(res[0]), 1);
    }

    buckList[0] = {'up_date':JSON.stringify($.now())};
    localStorage.setItem("favourites", JSON.stringify(buckList));

    BuildBucketList(buckList);
}

function Share(hash){

}

function SyncServer() {

    //TODO:
    var obj = JSON.parse(localStorage.getItem(MD5("uname")));

    if(!obj)
        return;

    try {

        var url = http + host + "/php/auth/synch.php";

        var formData = new FormData();
        //var bl = localStorage.getItem("favourites");
        var str = $.makeArray();
        if(buckList) {
            for(var val in buckList) {
                if(localStorage.getItem(buckList[val]))
                    str.push(JSON.stringify(localStorage.getItem(buckList[val])));
                else
                    str.push(JSON.stringify(buckList[val]));
            }
            formData.append("bl", JSON.stringify(str));
        }
        if(photosAr!=='undefined')
            formData.append("pl",JSON.stringify(photosAr));

        formData.append("sid",uObj.sid);

        formData.append("XDEBUG_SESSION_START","PHPSTORM");

        $.ajax({
            url: url,
            method: "POST",
            dataType: 'json',
            // headers: {"access-control-allow-origin": "some value"},
            data:formData,
            contentType: false,
            cache: false,
            processData: false,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            success: function (data) {
                if(data) {
                    for(var i=0; i<data.length; i++) {
                        if (data[i].bl) {
                            var str = data[i].bl;
                            buckList = JSON.parse(str);
                            //buckList = $.merge( bl, buckList);
                            localStorage.setItem("favourites", JSON.stringify(buckList));
                        }
                        if (data[i].pl) {
                            var str = data[i].pl;
                            photosAr = JSON.parse(str);
                            localStorage.setItem("photos", JSON.stringify(photosAr));
                        }
                        if (data[i].msg)
                            console.log(data[i].msg);


                    }
                }
            },
            error: function (xhr, status, error) {
                //var err = eval("(" + xhr.responseText + ")");
                console.log(error.Message);
            },
            complete: function (data) {
                console.log(data.responseText);
            },
        });

    }catch(ex){
        console.log(ex);
    }
}