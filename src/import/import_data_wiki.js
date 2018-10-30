export {GetWikipediaData};
import {sets} from "../global";
import {SetMarkersArExt} from "../index";
import {GetObjId} from '../utils/utils';

function GetWikipediaData(latlng, area, cb) {

    function processResult(apiResult) {

        var jsAr = [];
        for (var i = 0; i < apiResult.query.geosearch.length; i++) {
            var obj = apiResult.query.geosearch[i];
            var id_str = GetObjId(obj.lat,obj.lon);

            var cat = "ic_"+$('.category[cat=wiki]').attr('id');
            if (!localStorage.getItem(cat)) {
                localStorage.setItem(cat, "../categories/images/ic_"+$('.category[cat=wiki]').attr('id')+".png");
                /*
                var img = new Image();
                img.src = "./categories/images/ic_8.png";
                img.onload = function (ev) {
                    var w = img.width;
                    var h = img.height;
                    var dev = (w > h ? w : h);
                    var scale = (40 / dev).toPrecision(6);//.toFixed(6);
                    if (!localStorage.getItem(category)){
                        createThumb(this, img.width * scale, img.height * scale,category,function (thmb,category) {
                            localStorage.setItem(category, thmb.src);
                        });
                    }
                }*/
            }

            var url = "https://" + window.sets.lang + ".m.wikipedia.org/wiki/" + obj.title;
            var caption = '<a href="#"  onclick=\'OpenNewWindow("' + url + '","' + obj.title + '");\'>' + obj.title + '</a>';
            jsAr.push({
                category: $('.category[cat=wiki]').attr('id'),
                owner: 'wikipedia',
                type: '4',
                id: id_str,
                caption: caption,
                title: obj.title,
                longitude: obj.lon,
                latitude: obj.lat,
                ambit: 50,// search.dist,
                status: '1',
                level: '0',
                url: url,
                scale: 0.3,
                func: 'InsertIFrame'
            });
        }

        if(jsAr.length>0) {
            SetMarkersArExt($('.category[cat=wiki]').attr('id'), jsAr);
        }

    }
/*
   var url = 'https://'+lang+'.wikipedia.org/w/api.php?'+
        'action=query'+
        '&list=geosearch'+
        '&gsbbox='+area[1]+"|"+area[2]+"|"+area[0]+"|"+area[3]+//top left and bottom right corners 37.8|-122.3|37.7|-122.4,
        //gsradius: '1000',
        //gsmaxdim: '1000',
        '&gslimit=1000'+
        //gsprop: 'type|name|dim|country|region|globe',
        '&prop=revisions'+
        '&format=json';
    fetch(url)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (json) {
            processResult(json);
        }).catch(function (ex) {
            console.log(ex);
        });*/

    $.ajax({
        url: 'https://' + window.sets.lang + '.wikipedia.org/w/api.php',
        dataType: 'jsonp',
        data: {
            //gscoord: latlng[1].toString() + "|" + latlng[0].toString(),
            action: 'query',
            list: 'geosearch',
            gsbbox: area[1] + "|" + area[2] + "|" + area[0] + "|" + area[3],//top left and bottom right corners 37.8|-122.3|37.7|-122.4,
            //gsradius: '1000',
            //gsmaxdim: '1000',
            gslimit: '1000',
            //gsprop: 'type|name|dim|country|region|globe',
            prop: 'revisions',
            format: 'json'
        }
    })
    .done(function (data,res, par) {
        processResult(data);
        cb(true);
    }).fail(function (error) {
        console.log(JSON.stringify(error));
        cb(false);
    }).always(function () {
        //GetObjectsFromDB($('.category[cat=wiki]').attr('id'));
    });
}
