export {StopLocation,StartLocation, SearchPlace};
import {InitRecords} from './records.js';
import {InitPhotos} from './photos.js';
import {InitBucketList} from  '../menu/bl.js';
import {ol_map} from "../index";
import proj from 'ol/proj';

InitRecords();
InitPhotos();
InitBucketList();

function OnClickPanel() {
    //$("#container").css('pointer-events','none');/*non-clickable*/
}

function SearchPlace() {

    if($("#search_but").attr('drag')==='true') {
        $("#search_but").attr('drag',false);
        return;
    }
    let text = "Input location name";
    let hint =  "London, Trafalgar Square";
    if(window.window.sets.lang==='ru') {
        text = "Введите название местоположения";
        hint = "Москва, Красная площадь";
    }
    let place = prompt(text,hint);
    let nominatim =
        "https://nominatim.openstreetmap.org";///reverse";
    let query =
        "https://nominatim.openstreetmap.org/reverse?format=json&lat=52.5487429714954&lon=-1.81602098644987&zoom=18&addressdetails=1";
    let mapques =
        "https://open.mapquestapi.com/geocoding/v1/reverse?key=KEY&location=30.333472,-81.470448&includeRoadMetadata=true&includeNearestIntersection=true";
    let locationiq =
        "https://locationiq.org/v1/search.php";

    $.ajax({
        url: locationiq,// nominatim,
        data: {
            key: 'f6b910f0af894f1746b1',//locationiq
            format: "json",
            q: place,
            "accept-language": "en"
        },
        method: "GET",
        dataType: "json",
        success: function (data) {
            let resp = JSON.stringify(data, null, 4);
            if(!data[0].boundingbox)
                return;
            let bound = data[0].boundingbox;
            let lat = data[0].lat;
            let lon = data[0].lon;

            SetBounds({sw_lat: bound[0], sw_lng: bound[2], ne_lat: bound[1], ne_lng: bound[3]});
            $("#marker").trigger("change:cur_pos",[ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]), "Event" ]);
            //Marker.overlay.setPosition(ol.proj.fromLonLat([parseFloat(lon), parseFloat(lat)]), '*');//http://nedol.ru');

            // for (let i = 0; i < localStorage.length; i++) {
            //     let key = localStorage.key(i);
            //     if(key==='ObjectsAr')
            //        localStorage.removeItem(key);
            //     console.log(key + ' = ' + localStorage[key]);
            // }

        },
        error: function (data) {
            console.log(data);
        }
    });
}

function StartLocation() {

    if($("#loc_ctrl").attr('drag')==='true') {
        $("#loc_ctrl").attr('drag',false);
        return;
    }
    try {
        window.sets.loc_mode = !window.sets.loc_mode;
        if (window.sets.loc_mode) {
            if (window.sets.coords.gps[0] !== 0 && window.sets.coords.gps[1] !== 0) {

                $('#pin').css('display', 'block');

                //$('#marker>img').attr("src", "./marker/images/kolobot_walking.gif");
            }
        } else {
            StopLocation();
        }

    } catch (ex) {
        alert(ex);
    }
}

function StopLocation() {

    window.sets.loc_mode = false;

    $('#marker').trigger('stop_location');
    $('#pin').css('display', 'none');
    //$('#loc_img').removeAttr( "style" );
}


function SetBounds(obj) {
    try {
        ol_map.getView().fit(proj.transformExtent([parseFloat(obj.sw_lng), parseFloat(obj.sw_lat), parseFloat(obj.ne_lng), parseFloat(obj.ne_lat)], 'EPSG:4326', 'EPSG:3857'), {
            duration: window.sets.animate_duration
        }); // [minlon, minlat, maxlon, maxlat]
    } catch (ex) {
        alert(ex);
    }
}