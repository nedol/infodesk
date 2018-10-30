export {InitDOMEvents,CheckDeleteFeature};
import {ol_map} from "../index";
import Extent from 'ol/extent';


function InitDOMEvents() {

    $(window).on("orientationchange", function() {

        console.log("screen width " + screen.width );
        console.log("search_but left position " + $("#search_but").position().left);
        console.log("search_but top position " + $("#search_but").position().top);

        $("#bucket").css('left',parseInt(screen.width - 50)+'px');

        $("#zoom_but").css('left',parseInt(screen.width - 50)+'px');

        $("#search_but").css('left',parseInt(screen.width - 50 /*$("#search_but").css('left')*/)+'px');
        $("#search_but").css('top',parseInt(screen.height - $("#search_but").css('top'))+'px');

        $("#loc_ctrl").css('left',parseInt(screen.width - 50/*- $("#loc_ctrl").css('left')*/)+'px');
        $("#loc_ctrl").css('top',parseInt(screen.height - $("#loc_ctrl").css('top'))+'px');

    })

    $("#search_but").draggable({
        start: function() {
            console.log("drag start");
        },
        drag: function() {
            $("#search_but").attr('drag',true);
        },
        stop: function() {
            var rel_x = parseInt($("#search_but").position().left/window.innerWidth*100);
            $("#search_but").css('right', rel_x+'%');
            var rel_y = parseInt($("#search_but").position().bottom/window.innerHeight*100);
            $("#search_but").css('top', rel_y+'%');
        }
    });
    $("#loc_ctrl").draggable({
        distance: 20,
        start: function() {
            console.log("");
        },
        drag: function() {
            $("#loc_ctrl").attr('drag',true);
        },
        stop: function() {
            var rel_x = parseInt($("#loc_ctrl").position().left/window.innerWidth*100);
            $("#loc_ctrl").css('left', rel_x+'%');
            var rel_y = parseInt($("#loc_ctrl").position().top/window.innerHeight*100);
            $("#loc_ctrl").css('top', rel_y+'%');
        }
    });

    var zoom_y_0;
    var drag_zoom;
    $("#zoom_but").draggable({
        axis: "y",
        revert: true,
        delay: 50,
        start: function() {
            zoom_y_0 = $("#zoom_but").position();
            drag_zoom = true;

            setTimeout(function () {
                var zoom_y_1 = $("#zoom_but").position();
                if(zoom_y_0.top>zoom_y_1.top)
                    SetMapZoomInRec();
                else
                    SetMapZoomOutRec();
            },10);

            function SetMapZoomInRec(){
                var zoom = parseInt(ol_map.getView().getZoom());
                SetMapZoom(zoom+1, ol_map.getView().getCenter(),function () {
                    // Map.render();
                    var to = setTimeout(function () {
                         if(drag_zoom)
                             SetMapZoomInRec();
                         else
                             clearTimeout(to);
                    },100);
                });
            }

            function SetMapZoomOutRec(){
                var zoom = parseInt(ol_map.getView().getZoom());
                SetMapZoom(zoom-1, ol_map.getView().getCenter(), function () {
                    var to = setTimeout(function () {
                        if(drag_zoom)
                            SetMapZoomOutRec();
                        else
                            clearTimeout(to);
                    },100);
                });
            }

        },
        drag: function() {

        },
        stop: function() {
            drag_zoom = false;
            var y = parseInt($(this).position().top/window.innerHeight*100);
            $(this).css('top', y+'%');
        }
    });



    $("#bucket").draggable({
        start: function() {

        },
        drag: function() {

        },
        stop: function() {
            var rect = $(this)[0].getBoundingClientRect();
            var coordinate = ol_map.getCoordinateFromPixel([parseInt(rect.left+rect.width/2), parseInt(rect.bottom+rect.height/2)]);
            var inputs = $(".category[state=1]");
                $(inputs).each(function(i){
                    var layer = ol_map.getLayers().get($(inputs[i]).attr("id"));
                    if(layer) {
                        var feature = layer.getSource().getClosestFeatureToCoordinate(coordinate);
                        if(feature) {
                            var coor = feature.getGeometry();
                            CheckDeleteFeature(feature, [coor.B[0], coor.B[1]], layer);
                        }
                    }
            });
            // var feature = Map.forEachFeatureAtPixel([parseInt(rect.left+rect.width/2), parseInt(rect.bottom+rect.height/2)],
            //     function (feature, layer) {
            //         return feature;
            //     });
            //
            // if (feature)
            //     layer.getSource().removeFeature(feature);

        }
    });


};

function CheckDeleteFeature(feature, coordinate, layer){

    var rect = $("#bucket")[0].getBoundingClientRect();
    var lb = ol_map.getCoordinateFromPixel([rect.left,rect.bottom]);
    var rb = ol_map.getCoordinateFromPixel([rect.right,rect.bottom]);
    var rt = ol_map.getCoordinateFromPixel([rect.right,rect.top]);
    var lt = ol_map.getCoordinateFromPixel([rect.left,rect.top]);
    var coordinates = [lb, rb, rt, lt];
    var bucket_ext = Extent.boundingExtent(coordinates);
    var feature_ext = feature.getGeometry().getExtent();
    var ext = Extent.getIntersection(bucket_ext,feature_ext);
    if(!Extent.isEmpty(ext)) {
        var hash = feature.values_.features[0].getId();
        if (hash) {
            var obj = JSON.parse(localStorage.getItem(hash));
            obj.status = 0;
            localStorage.setItem(hash, JSON.stringify(obj));
            if(layer)
                layer.getSource().removeFeature(feature);
        }
    }
}


function SetMapZoom(zoom, coor, callback) {

    ol_map.getView().animate({
        zoom: zoom,
        duration: window.sets.animate_duration,
        center: coor
    }, function () {
        callback();
    });

    if(parseInt($("#zoom_but").text)!== parseInt(zoom))
        $("#zoom_but").text(parseInt(zoom));
    if (zoom >= 14)
        $("#zoom_but").css('color', 'blue');
    else
        $("#zoom_but").css('color', 'black');
}

