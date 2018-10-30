export {ol_map, osm, GetObjects,SetMarkersArExt};
// import 'ol/ol.css';

import map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import XYZ from 'ol/source/xyz';
import interaction from 'ol/interaction';
import control from 'ol/control';
import proj from 'ol/proj';

import {flyTo} from "./animate/animate";
import {Route} from "./location/route";
import {geo} from "./location/geolocation";

require('../src/panel/panel.js');
require('webpack-jquery-ui');
require('webpack-jquery-ui/css');
require('jquery-ui-touch-punch');

import {DB} from './storage/db.js';
import {ddd, ddd_obj} from './ddd/ddd';

import {StartLocation,SearchPlace,StopLocation} from "./panel/panel";

require('expose-loader?resize!../lib/jquery.ae.image.resize.min.js');
require('./events/feature_events.js');


require('expose-loader?Storage!./storage/storage.js');
// require('expose-loader?DB!./storage/db.js');
require('../src/import/import_data_wiki.js');

import {getParameterByName,GetObjId} from './utils/utils';
import {InitCategories} from '../src/categories/categories';
import {InitLayers,CreateLayer, AddCluster} from '../src/layers/layers';
import {InitEvents} from '../src/events/events';
import {InitDOMEvents} from '../src/events/dom_events';

require("./global");
import {InitSettings} from "./menu/settings";
import {InitMenu} from "./menu/menu.js";
import {DownloadOverlay} from "./overlay/overlay";

//require('aframe-gltf-exporter-component');

var extras = require('aframe-extras');
// Register a single component.

// AFRAME.registerComponent('json-model', extras.loaders.json-model);
// // Register a particular package, and its dependencies.
extras.loaders.registerAll();
// // Register everything.
// extras.registerAll();

// require('aframe-curve-component');
// require('aframe-alongpath-component');

let osm, ol_map, Geo, DDD ;

$(document).ready(function () {

    $('#ol-container').css('visibility', 'visible');

    setTimeout(function () {
        $('#splash').fadeOut("slow", function () {
            MapReady();
        });
    }, 1000);
});

function MapReady(mode) {

    //let full_screen = new ol.control.FullScreen();
    //full_screen.setTarget('full_screen');

    let lat_param = getParameterByName('lat');
    let lon_param = getParameterByName('lon');
    let zoom_param = getParameterByName('zoom');
    window.sets.app_mode = mode?mode:getParameterByName('mode');
    if(!window.sets.app_mode)
        window.sets.app_mode = 'id';
    if(!ol_map) {
        ol_map = new map({
            layers: [
                osm = new TileLayer({
                    source: new XYZ({
                        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        crossOrigin: 'null'
                    })
                })
            ],
            interactions: interaction.defaults({altShiftDragRotate: false, pinchRotate: false}),
            controls: control.defaults({
                zoom: false,
                attribution: false,
                rotate: false,
                attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                    collapsible: false
                })
            }).extend([
//            full_screen
            ]),
            target: 'map',
            view: new View({
                center: proj.fromLonLat([lon_param, lat_param]),
                //rotation: Math.PI / 5,
                extent: proj.get("EPSG:3857").getExtent(),
                zoom: 17
            })
        });
        ol_map.getLayers().set("OSM", osm, true);
    }

    InitSettings();

    if(!DDD)
        DDD = new ddd();

    $('#app_but').on('click', function () {

        MapReady('id');
    });

    if(window.sets.app_mode!=='demo') {

        $('#kolobot').attr('scale',".1 .1 .1");

        InitCategories();

        InitMenu();

        if(!window.db)
            window.db = new DB(function(){
            if(window.sets.app_mode==='quest')
                window.db.getFile("mega_route", function(data){
                    //let obj = JSON.parse(data);
                    if(data.data) {
                        new Route().DrawRoute(data.data);

                        flyTo( data.data[data.data.length-1], function(){
                            //Marker.overlay.setPosition(data.data[data.data.length-1]);
                        });
                    }
                });
        });

        // $('#category_include').remove();



        InitLayers();

        InitDOMEvents();

        InitEvents();

        Geo = new geo();

        ol_map.addInteraction(new feature.Drag());

        $('#loc_ctrl').on('click', StartLocation)
        $('#loc_ctrl').on('ontouchstart', StartLocation);

        $('#pin').on('click', StopLocation);
        $('#pin').on('ontouchstart', StopLocation);

        $('#search_but').on('click', SearchPlace);
        $('#search_but').on('ontouchstart', SearchPlace);

    }

    setTimeout(function () {

        if(window.sets.app_mode==='demo'){
            if(lat_param && lon_param){
                window.sets.coords.cur = proj.fromLonLat([parseFloat(lon_param), parseFloat(lat_param)]);
                let latlon = proj.toLonLat(window.sets.coords.cur);
                DownloadObject(lat_param, lon_param);
            }
        }

        let time = new Date().getTime();
        let cl = localStorage.getItem('cur_loc');
        cl = JSON.parse(cl);
        if(cl!=null && cl.time<1503824276869) {
            localStorage.clear();
        }

        if (!localStorage.getItem("cur_loc")) {

            let coor = proj.fromLonLat([parseFloat('-0.128105'), parseFloat('51.507340')])

            localStorage.setItem("cur_loc", "{\"lon\":" + coor[0] + "," +
                "\"lat\":" + coor[1] + ", \"time\":" + time + "}");
        }

        let c = JSON.parse(localStorage.getItem("cur_loc"));

        if(lat_param && lon_param)
            window.sets.coords.cur = proj.fromLonLat([parseFloat(lon_param), parseFloat(lat_param)]);
        else if(c)
            window.sets.coords.cur =[parseFloat(c.lon), parseFloat(c.lat)];
        else
            return;

        ol_map.getView().animate({
            center: window.sets.coords.cur,
            zoom: zoom_param?zoom_param:15,
            duration: window.sets.animate_duration * 2,

        }, function () {
            //$("#marker").trigger("change:cur_pos", [window.sets.coords.cur, "Event"]);
            let latlon = proj.toLonLat(window.sets.coords.cur);
            $('#locText').text(latlon[1].toFixed(6) + " " + latlon[0].toFixed(6));
            $("#zoom_but").text(zoom_param?zoom_param:15);
        });

    }, 300);
}


function GetObjects(cat){

    window.db.getRange(cat,window.area[0], window.area[2],window.area[1], window.area[3] ,function (cat,features) {
        let layer = ol_map.getLayers().get(cat);

        if (!layer) {
            layer = CreateLayer(cat, '1');
        }

        let source = layer.values_.vector;
        $.each(features, function (key, f) {
            if(f.values_.object.overlay && f.values_.object.overlay.includes('ddd')) {
                if(DDD)
                    DDD.CheckDownload3D(f.values_.object);
            }else if(!source.getFeatureById(f.getId()))
                AddCluster(layer, f);
        });

    });
}

function SetMarkersArExt(cat, jsAr) {

    var obj = jsAr.shift();
    window.db.setFile(obj, function (cat) {
        if(jsAr.length==0)
            GetObjects(cat);
        else
            SetMarkersArExt(cat,jsAr);
    });
}

function DownloadObject(lat, lon) {
    try{
        var url = http+host+'?'+ //
            "proj=id"+
            "&func=import_obj"+
            "&lat="+lat+
            "&lon="+lon;

        $.ajax({
            url: url,
            method: "GET",
            dataType: 'json',
            processData:false,
            async: true,   // asynchronous request? (synchronous requests are discouraged...)
            cache: false,
            crossDomain: true,
            error: function(xhr, status, error){
                //var err = eval("(" + xhr.responseText + ")");
                console.log(error.Message);
            },
            complete: function (data) {

                var obj = JSON.parse(data.responseText)[0];
                if(obj) {
                    obj.longitude =  parseFloat(obj.longitude);
                    obj.latitude = parseFloat(obj.latitude);
                    var obj_id = GetObjId(obj.latitude, obj.longitude);
                    if (obj.overlay) {
                        if ($("#" + obj_id + "_include").length === 0) {
                            if(obj.overlay.includes('.ddd.')){
                                new ddd_obj(obj).Download3d();
                                //$('a-scene')[0].renderer.render();
                            }else{
                                DownloadOverlay(obj.overlay, obj);
                            }
                        }
                    }
                }
            },
        });

    }catch (ex) {
        console.log();
    }
}