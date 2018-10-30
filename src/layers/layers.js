export {CreateLayer,InitLayers,bl_filter,AddCluster};
import {sets} from "../global";
import layerVector from 'ol/layer/vector';
import srcVector from 'ol/source/vector';
import BingMaps from 'ol/source/bingmaps';
import TileLayer from 'ol/layer/tile';
import OSM from 'ol/source/osm';
import Cluster from 'ol/source/cluster';
import Extent from 'ol/extent';
import Style from 'ol/style/style';
import Icon from 'ol/style/icon';
import Fill from 'ol/style/fill';
import Text from 'ol/style/text';
import Stroke from 'ol/style/stroke';
import {ol_map, osm} from "../index";
import {GetObjId} from "../utils/utils";
import source from 'ol/source/source';
import Observable from 'ol/observable';

import {RemoveOverlay,DownloadOverlay} from "../overlay/overlay";

let bl_filter = false;
function InitLayers(){

    try {
        //osm.setVisible(false);

        let sourceBingMaps = new BingMaps({
            key: window.sets.bing_key,
            imagerySet: 'Road',
            culture: 'ru'
        });

        let bingMapsRoad = new TileLayer({
            preload: Infinity,
            source: sourceBingMaps,
            map_type: true,
            url: 'http://[…]/{z}/{x}/{y}.png',
            crossOrigin: 'null'
        });

        bingMapsRoad.setVisible(true);
        ol_map.getLayers().push(bingMapsRoad,true);
        ol_map.getLayers().set("Bing", bingMapsRoad, true);

        let map_strg = localStorage.getItem("map");

        // if(map_strg)
        //     SetMapVisible(map_strg);

        $(".category").each(function (i, el) {
            let cat = $(el).attr("id");
            let state = $(el).attr("state");
            CreateLayer(cat, state);
        });

    }catch(ex){
        console.log("InitLayers");
    }
}


function SetMapVisible(map){

    let layers = ol_map.getLayers();
    layers.forEach(function(layer,i, layers){
        if(layer.values_.map_type) {
            layer.setVisible(false);
        }
    });

    $("[map='"+map+"']").attr("checked","checked");

    switch(map) {
        case "osm":
            layers.get("OSM").setVisible(true);
            break;
        case "google":
            layers.get("Google").setVisible(true);
            break;
        case "bing":
            layers.get("Bing").setVisible(true);
            break;
    }
}

function CreateLayer(cat, state) {
    let style;
    let features = [];

    let vectorSource = new srcVector({
        features: features
    });

    let clusterSource = new Cluster({
        distance: 100,//parseInt(50, 10),
        source: vectorSource
    });

    let vectorLayer = new layerVector({
        map_type: false,
        source: vectorSource,
        vector: vectorSource,
        cluster: clusterSource,
        style: function (cl_feature, atr) {

            let features = cl_feature.values_.features;
            if(features.length>0)
            $.each(features, function (key, feature) {

                let id_str = feature.getId();
                window.db.getFile(id_str, cl_feature, function (res, id_str, feature) {
                    if (res !== -1) {
                        let style = OutputObject(res);
                        if (style)
                            feature.setStyle(style);
                    }
                });

            });



            function OutputObject(obj) {

                if (!obj || parseInt(obj.status) === 0)
                    return null;

                if(obj.category==10){
                    //TODO SetFlash(cl_feature);
                }
                let logo = '';
                let scale = 1;

                if (obj.category === '3')
                    logo = '../src/images/empty.png';
                else
                    logo = obj.logo;
                scale = .3;//Map.getView().getZoom()/obj.ambit;


                if (!logo && obj.category!==3) {
                    if (obj.type === 1)
                        cat = 'ic_0_0.png';
                    let cat = String(obj.category>=10?Math.floor(obj.category/10)*10:obj.category);
                    logo = '../src/categories/images/ic_' + cat+'.png';
                    scale = 0.35;
                }

                if (features.length > 1 || obj.ambit * ol_map.getView().getZoom() <= 500) {

                    if (obj.overlay) {
                        let id_str = GetObjId(obj.latitude, obj.longitude);
                        RemoveOverlay(id_str);
                    }

                } else {
                    let ext = ol_map.getView().calculateExtent();
                    let res = Extent.getIntersection(ext, cl_feature.getGeometry().getExtent());
                    if (Extent.isEmpty(res)) {//out of screen

                        if (obj.overlay) {
                            let id_str = GetObjId(obj.latitude, obj.longitude);
                            RemoveOverlay(id_str);
                        } else {
                            let layer = ol_map.getLayers().get(obj.category);
                            layer.getSource().removeFeature(cl_feature);
                        }
                        return null;
                    } else if (obj.overlay && jQuery.inArray(obj, ar) === -1) {
                        ar.push(obj);


                        //DownloadOverlayIFrame(obj.overlay, obj);
                        //return;
                    }
                }


                let opacity;
                if (parseInt(obj.status) === 2 && obj.category !== '12')
                    opacity = 0.3;
                else
                    opacity = 1.0

                let icon = new Icon(/** @type {olx.style.IconOptions} */ ({
                    //size: [50,40],
                    //img: img ? [img.width, img.height] : undefined,
                    scale: scale, //cl_feature.I.features.length>1 || obj.image.indexOf('/categories/')!== -1?0.3:1.0,//
                    anchor: [0, 0],
                    anchorOrigin: 'bottom-left',
                    offset: [0, 0],
                    anchorXUnits: 'pixel',
                    anchorYUnits: 'pixel',
                    color: [255, 255, 255, 1.0],
                    opacity: opacity,
                    src: logo
                }));
                let iconStyle;
                if (features.length > 1) {
                    iconStyle = new Style({
                        text: new Text({
                            text: cl_feature.values_.features.length.toString(),
                            font: '12px serif',
                            align: 'right',
                            scale: 1.2,
                            offsetX: 40,
                            offsetY: -5,
                            fill: new Fill({
                                color: 'blue'
                            }),
                            stroke: new Stroke({
                                color: 'white',
                                width: 2
                            })
                        }),
                        image: icon,
                        zIndex: 2
                    });
                } else {

                    iconStyle = new Style({
                        text: new Text({
                            text: (obj.overlay === '' || !obj.overlay ? obj.title : ''),
                            font: '8px serif',
                            align: 'center',
                            scale: 1.5,
                            offsetX: 15,
                            offsetY: 0,
                            baseline: 'top',
                            fill: new Fill({
                                color: 'red'
                            }),
                            stroke: new Stroke({
                                color: 'white',
                                width: 2
                            })
                        }),
                        image: icon,
                        zIndex: 2
                    });
                }


                // setTimeout(function (feature,style) {
                //     style.setImage( new ol.style.Icon({
                //         src: ic_8,
                //         rotateWithView: true,
                //         anchor: [.5, .5],
                //         anchorXUnits: 'pixel', anchorYUnits: 'pixel',
                //         opacity: 1
                //     }));
                //     feature.setStyle(style); !!!
                // },100,cl_feature, iconStyle);


                //TODO
                let shadowStyle = new Style({
                    stroke: new Stroke({
                        color: 'rgba(0,0,0,0.5)',
                        width: 100
                    }),
                    zIndex: 1
                });

                style = [iconStyle, shadowStyle];

                return style;
            }
        }

    });

    let arr = ol_map.getLayers().getArray();
    let res = $.grep(arr, function (el, i) {
        return el === vectorLayer;
    });
    if (res.length <= 0) {
        ol_map.getLayers().push(vectorLayer);
        ol_map.getLayers().set(cat, vectorLayer, true);
    }

    vectorLayer.setProperties({opacity: 1.0, contrast: 1.0});//setBrightness(1);
    vectorLayer.setVisible(state === '0' ? false : true);

    return vectorLayer;

}

function SetFlash(feature){

    let duration = 3000;


    if(feature.interval)
        return;
    function flash(feature) {
        let start = new Date().getTime();
        let listenerKey;
        function animate(event) {

            let vectorContext = event.vectorContext;
            let frameState = event.frameState;
            let flashGeom = feature.getGeometry().clone();
            let elapsed = frameState.time - start;
            let elapsedRatio = elapsed / duration;
            // radius will be 5 at start and 30 at end.
            let radius = ol.easing.easeOut(elapsedRatio) * 25 + 5;
            let opacity = ol.easing.easeOut(1 - elapsedRatio);

            let style = new Style({
                image: new ol.style.Circle({
                    radius: radius,
                    snapToPixel: false,
                    stroke: new Stroke({
                        color: 'rgba(255, 0, 0, ' + opacity + ')',
                        width: 0.25 + opacity
                    })
                })
            });


            vectorContext.setStyle(style);
            vectorContext.drawGeometry(flashGeom);
            if (elapsed > duration) {
                Observable.unByKey(listenerKey);
                return;
            }

            ol_map.render();
            // tell OpenLayers to continue postcompose animation

        }
        listenerKey = ol_map.on('postcompose', animate);
    }


    feature.interval = setInterval(function () {
        flash(feature);
    }, 3000);

}

function AddCluster(layer,  new_features){

    let vectorSource = layer.values_.vector;
    if(new_features.length>=2) {
        vectorSource.addFeatures(new_features);
    }else {
        vectorSource.addFeature(new_features);
    }

    let clusterSource = new Cluster({
        distance: 100,//parseInt(50, 10),
        source: vectorSource
    });

    layer.setSource(clusterSource);
}



let ar = [];
let flag = true;
function AddOverlayRecurs() {
    if(flag && ar.length>0) {
        let obj = ar.shift();
        flag = false;
        let obj_id = GetObjId(obj.latitude, obj.longitude);
        if ((obj.overlay.startsWith("http") || obj.overlay.startsWith("./"))) {
            if ($("#" + obj_id + "_include").length === 0) {
                DownloadOverlay(obj.overlay, obj);
                //test OverlayFrame(obj.overlay, obj)
            }else{
                    flag = true;
                    AddOverlayRecurs();
                }

            } else {
                $('#locText').before(obj.overlay);
                flag = true;
                AddOverlayRecurs();
            }

    }

}

