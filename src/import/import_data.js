export {ImportData,areasAr};
import {GetWikipediaData} from './import_data_wiki.js';
import {GetDataOSM} from './import_data_osm.js';
import {GetIDData} from './import_data_id.js';
import {sets} from "../global";
import {ol_map, GetObjects} from "../index";
import proj from 'ol/proj';
import {User} from "../menu/user";

var areasAr = jQuery.makeArray();

window.GetDataSrc = function(){


    var ds = JSON.parse(localStorage.getItem("data_src"));
    var ar = [];
    for(var i in ds){
        ar[ds[i]] = true;
    }
    if($("[cat=wiki]").attr('state')==='1')
        ar['wiki'] = true;

    return ar;
};

function ImportData(event) {

    if(!window.sets.coords.cur)
        return;
    var LotLat = proj.toLonLat(window.sets.coords.cur);

    if(ol_map.getView().getZoom()>=14) {
        try{
            $(".category[state='1']").each(function (i,item) {

                switch ($(item).attr('id')) {
                    // case '0':
                    //     break;
                    case  $('.category[cat=wiki]').attr('id'):
                        (function () {
                            area =[
                                (parseFloat(LotLat[1].toFixed(2)) - 0.01).toFixed(2),
                                (parseFloat(LotLat[1].toFixed(2)) + 0.01).toFixed(2),
                                (parseFloat(LotLat[0].toFixed(2)) - 0.01).toFixed(2),
                                (parseFloat(LotLat[0].toFixed(2)) + 0.01).toFixed(2)
                            ];
                            window.area = area;
                            var str = "wiki_" + $(item).attr('id')+ "_" + area;
                            if(GetDataSrc()['wiki'])
                            if(!IsDownloadedArea(str)) {
                                //console.log("download area:"+JSON.stringify(area));
                                GetWikipediaData(LotLat, area, function (res) {
                                    if(res)
                                        areasAr.push(str);
                                });

                            }
                        })();

                        break;

                    default:
                        var area =[
                            (parseFloat(LotLat[1].toFixed(1)) - 0.05).toFixed(2),
                            (parseFloat(LotLat[1].toFixed(1)) + 0.05).toFixed(2),
                            (parseFloat(LotLat[0].toFixed(1)) - 0.05).toFixed(2),
                            (parseFloat(LotLat[0].toFixed(1)) + 0.05).toFixed(2)
                        ];
                        window.area = area;
                        var str = "osm_" + $(item).attr('id')+ "_" + area;

                        if(GetDataSrc()['osm']) {
                            //console.log("GetDataSrc()['osm']:"+GetDataSrc()['osm']);
                            if (!IsDownloadedArea(str)) {

                                GetDataOSM($(item).attr('id'), area, function (res) {
                                   if(res)
                                     areasAr.push(str);
                                });
                            }
                        }

                        var str = "gp_" + $(item).attr('id')+ "_" + area;
                        if(GetDataSrc()['google'])
                        if(!IsDownloadedArea(str)) {
                            //GetGoogleData(queryAr.attr('id'), area);
                            areasAr.push(str);
                        }

                        str = "id_" + $(item).attr('id')+ "_" + User.level + "_" + area;

                        if(!IsDownloadedArea(str)) {
                            GetIDData($(item).attr('id'),str, LotLat,User.level, function (res) {
                               if(res)
                                  areasAr.push(str );
                            });

                        }

                        break;
                }

                if(window.db)
                    GetObjects($(item).attr('id'));


            });
        }catch(ex){
            console.log(ex);
        }
    }

    function IsDownloadedArea(area){
        var res = $.grep(areasAr, function(el, index){
            return el===area;
        });

        return res.length>0?true:false;
    }


}