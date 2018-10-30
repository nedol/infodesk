export {GetDataOSM};
import {SetMarkersArExt} from "../index";

var reqAr=[];

function GetDataOSM(cat,area, cb) {
    // left,bottom,right,top
    // min Longitude , min Latitude , max Longitude , max Latitude

    var lat_1 = area[0];
    var lat_2 = area[1];
    var lng_1 = area[2];
    var lng_2 = area[3];
    
    var str_node='';

    var str_bnd  = '(' + lat_1 + ',' + lng_1 + ',' + lat_2 + ',' + lng_2 + ');';
    
    switch (parseInt(cat)) {

        case 0://records
            break;
        case 1://photos
            break;
        case 3://quest
            break;
        case 4://wiki
            break;
        case 10://AR
            break;
        case 20://hotel
            BuildRequest('node[tourism=hostel]'+str_bnd,{category: 20});
            BuildRequest('node[tourism=chalet]'+str_bnd,{category: 20});
            BuildRequest('node[tourism=hotel]'+str_bnd,{category: 20});
            BuildRequest('node[tourism=apartment]'+str_bnd,{category: 20});
           
            //CallAmadeus(db, doc, lat_1, lng_1, lat_2, lng_2);

            break;
        case 30://attraction
            BuildRequest('node[historic=castle]'+str_bnd,{category: 30});
            BuildRequest('node[tourism=attraction]'+str_bnd,{category: 30});
            BuildRequest('node[tourism=viewpoint]'+str_bnd,{category: 30});
            BuildRequest('node[tourism=gallery]'+str_bnd,{category: 30,logo: './categories/images/museum.png'});
            BuildRequest('node[tourism=museum]'+str_bnd,{category: 30,logo: './categories/images/museum.png'});

            break;

        case 40://food
            BuildRequest('node[amenity=fast_food]'+str_bnd,{category: 40});
            BuildRequest('node[amenity=restaurant]'+str_bnd,{category: 40});
            BuildRequest('node[amenity=bar]'+str_bnd,{category: 40});
            BuildRequest('node[amenity=biergarten]'+str_bnd+'way[amenity=biergarten]'+str_bnd,{category: 40,logo: './categories/images/beer.png'});
            BuildRequest('node[craft=brewery]'+str_bnd+'way[craft=brewery]'+str_bnd,{category: 40,logo: './categories/images/beer.png'});
            BuildRequest('node[craft=winery]'+str_bnd+'way[craft=winery]'+str_bnd,{category: 40,logo: './categories/images/barrel.png'});
            BuildRequest('node[amenity=cafe]'+str_bnd+'node[shop=coffee]'+str_bnd,{category: 40, logo: './categories/images/coffecup.png'});
            BuildRequest('node[shop=bakery]'+str_bnd,{category: 40});
            BuildRequest('node[shop=beverages]'+str_bnd,{category: 40});
            BuildRequest('node[shop=alcohol]'+str_bnd,{category: 40});
            BuildRequest('node[shop=cheese]'+str_bnd,{category: 40});
            BuildRequest('node[shop=butcher]'+str_bnd,{category: 40});
            BuildRequest('node[shop=deli]'+str_bnd,{category: 40});
            BuildRequest('node[shop=pastry]'+str_bnd+'node[shop=pasta]'+str_bnd,{category: 40});

            break;
        case 50://shopping
            BuildRequest('node[shop=boutique]'+str_bnd+'way[shop=boutique]'+str_bnd,
                {category: 50,logo: './categories/images/fashion.png'});
            break;

        case 60://finance

            BuildRequest('node[amenity=bank]'+str_bnd,{category:60});
            BuildRequest('node[amenity=atm]'+str_bnd+'way[amenity=atm]'+str_bnd+'relation[amenity=atm]'+str_bnd,
                {category: 60, logo: './categories/images/atm.png',ovl:''});
            break;

        case 70://entertainment
           
            BuildRequest('node[amenity=theatre]'+str_bnd,{category: 70});
            BuildRequest('node[amenity=nightclub]'+str_bnd,{category: 70});
            BuildRequest('node[tourism=theme_park]'+str_bnd,{category: 70});
            BuildRequest('node[piste:type]'+str_bnd+'way[piste:type]'+str_bnd,{category: 70});
            break;

        case 80://

            BuildRequest('node[amenity=atm]'+str_bnd+'way[amenity=atm]'+str_bnd+'relation[amenity=atm]'+str_bnd,
                {category: 80, logo: './categories/images/atm.png',ovl:''});
            BuildRequest('node[amenity=bank]'+str_bnd,{category: 80});

            break;
        case 90:
            BuildRequest('node[railway=station]'+str_bnd,
                {category: 90, logo: './categories/images/moscow.metro.png', web:'http://www.metro.ru/map/2001/2/'});
            BuildRequest('node[amenity=parking]'+str_bnd,
                {category: 90, logo: './categories/images/parking.png', web:''});
            BuildRequest('node[amenity=vending_machine][vending=parking_tickets]'+str_bnd,{category: 90});
            BuildRequest('node[landuse=garages]'+str_bnd,{category: 90});
            BuildRequest('node[amenity=bicycle_parking]'+str_bnd,{category: 90,logo: './categories/images/bike.png'});
            BuildRequest('node[amenity=bicycle_rental]'+str_bnd,{category: 90,logo: './categories/images/bike.png'});
            BuildRequest('node[amenity=car_repair]'+str_bnd,{category: 90,logo: './categories/images/car-repair.png'});
            // BuildRequest('node[amenity=car_rental]'+str_bnd);
            BuildRequest('node[highway=services]'+str_bnd,{category: 90});
            break;

        default:
            break;
    }

    ProceedRequest(cat, cb);
}

function BuildRequest(str, attr) {

    var url = 'https://overpass-api.de/api/interpreter';
    var data = '[out:json][timeout:25];(' + str + ');(._;>;);out;';//>;out skel qt;';   //;

    reqAr.push({url:url, data: data, attr:attr});

}

function ProceedRequest(c, cb) {
    //external==true, internal==false
    if(reqAr.length==0 ) {
        cb(true);
        return;
    }
    
    var obj = reqAr.shift();
/*
    var myInit = { method: 'GET',
        mode: 'cors',
        cache: 'default',
        cat:'3' };

    var request = new Request(obj.url+"?data="+obj.data+"&cat=3", myInit);

    fetch(request)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (json) {
            processResult(json,this.cat);
        });
    //console.log(obj.url+"?data="+obj.data);
    */
    $.ajax({
        url: obj.url+"?data="+obj.data,
        //data: {data: obj.data},
        //headers: request_headers,
        attr:obj.attr,
        processData:false,
        dataType: 'json',
        type: 'GET',
        async: true,
        crossDomain: true

        //,success: new processResult
    })
    .done(function (data,res, par) {
        processResult(data,res, par, this.attr);
        cb(true);
     }).fail(function (error) {
        console.log(JSON.stringify(error));
        cb(false);
     }).always(function () {
        //GetObjectsFromDB(this.attr.category);
     });

    function processResult(data,res, par, attr) {

        var jsAr = [];

        for (var i = 0; i < data.elements.length; i++) {

            try {
                var phone=null,caption=null, website=null, title=null;

                var osm = data.elements[i];
                var id_str = GetObjId(osm.lat, osm.lon);
                var ar = Object.keys(osm.tags);

                for (var k in ar) {

                    if(osm.tags[ar[k]].includes("flickr.com"))
                        continue;

                    if(!GetDataSrc()['facebook'] && osm.tags[ar[k]].includes("facebook"))
                        continue;

                    title = osm.tags['name:'+lang];
                    if(!title)
                        title = osm.tags.name;

                    if (osm.tags[ar[k]].includes("http")) {
                        website = osm.tags[ar[k]];

                    } else {
                        //website = undefined;
                        if (!website && osm.tags[ar[k]].includes("www") ||
                            ar[k].includes("website")) {
                            website = "http://" + osm.tags[ar[k]];
                        }
                    }

                    if (ar[k].includes("phone")) {
                        phone = osm.tags[ar[k]];
                    } else {
                        phone = undefined;
                    }
                }

                if (website)
                    caption = "<a href=\'#\'  onclick=\"OpenNewWindow(\'" + website + "\',\'" + data.elements[i].tags.name + "\');\">"+ data.elements[i].tags.name +"</a>";

                else
                    caption = (osm.tags.name?osm.tags.name:'');

                var logo = attr.logo;

                if (!logo) {
                    var img = new Image();
                    img.src = './categories/images/ic_' + attr.category+".png";
                    img.onload = function (ev, logo) {
                        var w = this.width;
                        var h = this.height;
                        var dev = (w > h ? w : h);
                        var scale = (50 / dev).toPrecision(6);//.toFixed(6);
                        createThumb(this, w * scale, h * scale, logo, function (thmb, logo) {
                                //var id_str = GetObjId(obj.latitude,obj.longitude);
                            logo = "data:image/*;base64," + thmb.src;
                        });
                    };
                }

                //     $.ajax({
                //         url:  http+host+'/php/getHeaders.php'+"?url="+website,
                //         processData:false,
                //         dataType: 'json',
                //         type: 'GET',
                //         async: true,
                //         crossDomain: true,
                //         id:id_str
                //         //,success: new processResult
                //     })
                //         .done(function (data,res, par) {
                //             var headers = data;
                //             var res = $.grep(headers,function (el, index) {
                //                 return el==='X-Frame-Options: SAMEORIGIN';
                //             });
                //             if(res.length!==0){
                //                 SetObjectAttr(this.id, 'status', '3');
                //                 obj.status = '3';
                //             }
                //         }).fail(function (error) {
                //         console.log(error);
                //     }).always(function () {
                //         //console.log("");
                //     });

                    jsAr.push({
                        owner: 'osm',
                        category: attr.category,
                        id: id_str,
                        caption: caption,
                        title: title,
                        type: '4',
                        overlay: function(){
                            // if(website.includes("shoko.ru"))
                            //     return "./html/shoko.html?v=0";
                            if(attr.ovl)
                                return attr.ovl;
                            if(!website)
                                return;
                            if(website.includes("kfc."))
                                return "./html/kfc.html?v=0";
                            if(website.includes("mcdonalds"))
                                return "./html/mcdonalds.html";
                            if(website.includes("starbucks"))
                                return "./html/starbucks.html";
                            if(website.includes("kartoshka."))
                                return "./html/kartoshka.html";
                            if(website.includes("burgerking."))
                                return "./html/bking.html";
                            if(website.includes("subway."))
                                return "./html/subway.html";
                            if(website.includes("pizzahut."))
                                return "./html/pizzahut.html";
                            if(website.includes("papajohns."))
                                return "./html/papajohns.html";
                            if(website.includes("pret."))
                                return "./html/pret.html";
                            else return "";
                        }(),
                        //name_en: data.elements[i].tags.name_en,starbucks
                        //tourism: data.elements[i].tags.tourism,
                        longitude: data.elements[i].lon,
                        latitude: data.elements[i].lat,
                        url: attr.web,
                        phone: phone,
                        scale: 0.3,
                        ambit: 30,
                        status: '1',
                        level:'0',
                        logo: function(logo) {
                            if(!title)
                                return logo;
                            var lc_title = title.toLowerCase();
                            if (lc_title.includes('кофе') ||
                                lc_title.includes('coffee'))
                                return './categories/images/coffecup.png';
                            if (lc_title.includes('пиво') ||
                                lc_title.includes('bier'))
                                return './categories/images/beer.png';
                            else
                                return logo;
                        }(logo),
                        func: 'InsertIFrame'
                    });

            } catch (ex) {
                console.log(ex);
            }
        }

        if(jsAr.length>0)
            SetMarkersArExt(attr.category,jsAr);

        setTimeout(function () {
            ProceedRequest(attr.category);
        },300);

    }
}