/**
 * Created by android on 21.02.2017.
 */
function GetGoogleData(latlng, area) {

    function processResult(apiResult) {

        var jsAr = [];
        for (var i = 0; i < apiResult.query.geosearch.length; i++) {
            var obj = apiResult.query.geosearch[i];
            var id_str = GetObjId(obj.latitude,obj.longitude);
            if (!localStorage.getItem(id_str)) {
                var url = "https://" + lang + ".m.wikipedia.org/wiki/" + obj.title;
                var caption = "<a href=\'#\'  onclick=\"OpenNewWindow(\'"+url+"\',\'"+obj.title+"\');\">"+obj.title+"</a>";
                jsAr.push({
                    category: '8',
                    owner: 'wikipedia',
                    //id: search.pageid,
                    filename: fn,
                    id: id_str,
                    caption: caption,
                    longitude: obj.longitude,
                    latitude: obj.latitude,
                    ambit: 50,// search.dist,
                    status: '1',
                    level:'0',
                    url: url,
                    scale: 0.3,
                    image: "./categories/images/ic_8.png",
                    func: 'InsertIFrame'
                });

            }
        }

        if(jsAr.length>0)
            SetMarkersArExt(8,jsAr);

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
        url: 'https://'+lang+'.wikipedia.org/w/api.php',
        data: {
            //gscoord: latlng[1].toString() + "|" + latlng[0].toString(),
            action: 'query',
            list: 'geosearch',
            gsbbox: area[1]+"|"+area[2]+"|"+area[0]+"|"+area[3],//top left and bottom right corners 37.8|-122.3|37.7|-122.4,
            //gsradius: '1000',
            //gsmaxdim: '1000',
            gslimit: '1000',
            //gsprop: 'type|name|dim|country|region|globe',
            prop: 'revisions',
            format: 'json'
        },
        dataType: 'jsonp',
        success: processResult
    });
}
