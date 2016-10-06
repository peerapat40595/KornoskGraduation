$(function(){function inIframe(){try{return window.self!==window.top;
}catch(e){return true;
}};
if(inIframe()){document.write("Load from https://fastpokemap.se<br/>Load from https://fastpokemap.se<br/>Load from https://fastpokemap.se<br/>Load from https://fastpokemap.se<br/>Load from https://fastpokemap.se<br/>Load from https://fastpokemap.se<br/>");
}});
var pokemonPNG=[];
var myPokeControl;
var trackingEnabled=false;
var shownMarker=[];
var cookiedelimchar='x';
var filterdict={};
var isLoading=false;
var isBusy=false;
L.HtmlIcon=L.Icon.extend({options:{},initialize:function(options){L.Util.setOptions(this,options);
},createIcon:function(){var div=document.createElement('div');
if(this.options.hide){div.innerHTML='<div class="displaypokemon hidden" data-pokeid="'+ this.options.pokemonid+'">'+'<div class="pokeimg">'+'<img style="min-height:0px;" src="https://life360-img.s3.amazonaws.com/img/user_images/90b5430d-98cf-48b4-95cb-37202f7346b1/0632af4b-80ab-4cfc-96f4-8ac4aeb10fdf.jpg?fd=2" />'+'</div>'+'<div class="remainingtext" data-expire="'+ this.options.expire+'"></div>'+'</div>'}else{div.innerHTML='<div class="displaypokemon" data-pokeid="'+ this.options.pokemonid+'">'+'<div class="pokeimg">'+'<img src="https://life360-img.s3.amazonaws.com/img/user_images/90b5430d-98cf-48b4-95cb-37202f7346b1/0632af4b-80ab-4cfc-96f4-8ac4aeb10fdf.jpg?fd=2" />'+'</div>'+'<div class="remainingtext" data-expire="'+ this.options.expire+'"></div>'+'</div>';
};
return div;
},createShadow:function(){return null;
}});
var map;
function deleteDespawnedPokemon(){var j;
	for(j in shownMarker){var active=shownMarker[j].active;
		var expire=shownMarker[j].expire;
		var now=Date.now();
		if(active==true&&expire<=now){map.removeLayer(shownMarker[j].marker);
			shownMarker[j].active=false;
		}}};
		function createPokeIcon(pokemonid,timestamp,filtered){return new L.HtmlIcon({pokemonid:pokemonid,expire:timestamp,hide:filtered});
	};
	function loadCache(cp){$.getJSON("https://cache.fastpokemap.se/?key="+ window.fingerprint+"&ts="+ window.salt+"&compute="+ window.myIp+"&lat="+ cp.lat+"&lng="+ cp.lng,function(data){if(data.length>=1){var i=0;
		var spawn={};
		for(i in data){var cachedSpawn=data[i];
			if(new Date(cachedSpawn.expireAt).getTime()>new Date().getTime()){spawn.encounter_id=cachedSpawn.encounter_id;
				spawn.latitude=cachedSpawn.lnglat.coordinates[1];
				spawn.longitude=cachedSpawn.lnglat.coordinates[0];
				spawn.pokemon_id=cachedSpawn.pokemon_id;
				spawn.expiration_timestamp_ms=new Date(cachedSpawn.expireAt).getTime();
				addPokemonToMap(spawn);
			}}}});
};
var throttledLoadCache=_.throttle(loadCache,2000);
function addPokemonToMap(spawn){var j;
	var toAdd=true;
	for(j in shownMarker){if(shownMarker[j].id==spawn.encounter_id){toAdd=false;
		break}};
		if(toAdd){var cp=new L.LatLng(spawn.latitude,spawn.longitude);
			var pokeid=PokemonIdList[spawn.pokemon_id];
			var filtered=false;
			if(parseInt(pokeid)in filterdict){filtered=true;
			};
			var pokeMarker=new L.marker(cp,{icon:createPokeIcon(pokeid,spawn.expiration_timestamp_ms,filtered)});
			shownMarker.push({marker:pokeMarker,expire:spawn.expiration_timestamp_ms,id:spawn.encounter_id,active:true});
			map.addLayer(pokeMarker);
			pokeMarker.setLatLng(cp);
		}};
		var isScanning=false;
		function getPokemon(lat,lng){$.ajax({dataType:"json",url:"https://api.fastpokemap.se/?key="+ window.fingerprint+"&ts="+ window.salt+"&lat="+ lat+"&lng="+ lng,success:function(data){if(data.error&&data.error=="overload"){return setTimeout(function(){getPokemon(lat,lng);
		},500);
	};
	console.log("Successful scan");
	$(".scan").prop("disabled",false);
	isScanning=false;
	status='success';
	$('.scan').removeClass('active').addClass(status);
	setTimeout(function(){$('.scan').removeClass(status);
},1500);
	$(".nearby").html('<h3>FOUND</h3>');
	if(data&&data.result&&data.result.length>=1){var i;
		var bufferRadar='<h3>FOUND</h3>';
		var foundNearbyPokemon=false;
		for(i in data.result){var spawn=data.result[i];
			if(spawn.spawn_point_id!=undefined){if(spawn.expiration_timestamp_ms<=0);
				spawn.expiration_timestamp_ms=Date.now()+ 930000;
				addPokemonToMap(spawn);
			}else if(spawn.lure_info!=undefined){spawn.encounter_id=spawn.lure_info.encounter_id;
				spawn.pokemon_id=spawn.lure_info.active_pokemon_id;
				spawn.expiration_timestamp_ms=spawn.lure_info.lure_expires_timestamp_ms;
				addPokemonToMap(spawn);
			};
			foundNearbyPokemon=true;
			bufferRadar+='<div class="pokemon"><img src="data:image/pngbase64,'+ pokemonPNG[PokemonIdList[spawn.pokemon_id]]+'" /></div>';
		};
		$(".nearby").html(bufferRadar);
	};
	if(foundNearbyPokemon){$(".nearby").show();
}else{$(".nearby").hide();
}},timeout:50000}).fail(function(xhr,status){console.log("Scan failed");
$(".scan").prop("disabled",false);
curstatus='failed';
isScanning=false;
var currfailure=(new Date).getTime();
$('.scan').data("failid",currfailure);
$('.scan').removeClass('active').addClass(curstatus);
setTimeout(function(){if($('.scan').data("failid")==currfailure){$('.scan').removeClass(curstatus);
	currfailure=null;
}},1500);
});
};
var nearbyForm;
function DrawS2(S2ID){var S2=window.S2.S2;
	var latlng=S2.idToLatLng(""+ S2ID+"");
	var cell=S2.S2Cell.FromLatLng(latlng,15);
	var corner=cell.getCornerLatLngs();
	var arrayLatLng=[];
	arrayLatLng.push(new L.LatLng(corner[0].lat,corner[0].lng));
	arrayLatLng.push(new L.LatLng(corner[1].lat,corner[1].lng));
	arrayLatLng.push(new L.LatLng(corner[2].lat,corner[2].lng));
	arrayLatLng.push(new L.LatLng(corner[3].lat,corner[3].lng));
	if(nearbyForm!=undefined){map.removeLayer(nearbyForm);
	};
	nearbyForm=new L.polygon(arrayLatLng);
	map.addLayer(nearbyForm);
};
function findCoordinate(addr){$.getJSON("https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find?text="+ addr+"&f=json",function(data){$("#locationBtn").prop("disabled",false);
	$("#locationBtn").html('<span class="glyphicon glyphicon-search" aria-hidden="true"></span>');
	if(data.locations&&data.locations[0]&&data.locations[0].feature&&data.locations[0].feature&&data.locations[0].feature.geometry){$('.window').removeClass('show');
	$('.nearby, .left, .center, .right').removeClass('hidden');
	var lat=data.locations[0].feature.geometry.y;
	var lng=data.locations[0].feature.geometry.x;
	var resultLatLng=new L.LatLng(lat,lng);
	window.location.hash=(lat+","+ lng);
	map.setView(resultLatLng,16);
	marker.setLatLng(resultLatLng);
	throttledLoadCache(resultLatLng);
}else{alert("Couldn't find location... Be less specific");
}});
};
var firstTime=true;
function onLocationFound(event){console.log("New location");
var cp=new L.LatLng(event.latlng.lat,event.latlng.lng);
marker.setLatLng(cp);
map.setView(cp);
throttledLoadCache(cp);
if(!isScanning&&!firstTime){if(!$('.scan').hasClass('active')){$('.scan').removeClass('success').removeClass('failed').addClass('active');
};
$(".scan").prop("disabled",true);
circle.setLatLng(cp);
isScanning=true;
getPokemon(cp.lat,cp.lng);
}else if(firstTime){circle.setLatLng(cp);
	firstTime=false;
}};
function initmap(){map=new L.Map('map',{attributionControl:false});
setInterval(updateTime,1000);
//setInterval(autoTrack,5000);
var osmUrl='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
var osm=new L.TileLayer(osmUrl,{minZoom:2,maxZoom:18,noWrap:true,});
//map.addLayer(marker);
map.addLayer(osm);
//map.addLayer(circle);
var credits=L.control.attribution().addTo(map);
credits.addAttribution('Powered by Esri, HERE, DeLorme, NGA, USGS');
map.on("movestart",function(event){isBusy=true;
});
map.on("zoomstart",function(event){isBusy=true;
});
map.on("dragstart",function(event){isBusy=true;
});
map.on("dragend",function(event){isBusy=false;
});
map.on("moveend",function(event){isBusy=false;
});
map.on("zoomend",function(event){isBusy=false;
});
/*
map.on("click",function(event){var lat=event.latlng.lat;
	var lng=event.latlng.lng;
	var cp=new L.LatLng(lat,lng);
	try{window.location.hash=(lat+","+ lng);
	marker.setLatLng(cp);
	if(!isScanning){$(".scan").prop("disabled",true);
	isScanning=true;
	if(!$('.scan').hasClass('active')){$('.scan').removeClass('success').removeClass('failed').addClass('active');
};
circle.setLatLng(cp);
getPokemon(cp.lat,cp.lng);
}}catch(e){};
throttledLoadCache(cp);
});
map.on("dblclick",function(event){var cp=new L.LatLng(event.latlng.lat,event.latlng.lng);
	marker.setLatLng(cp);
});
*/
map.locate({setView:true,maxZoom:14});
map.on('locationfound',onLocationFound);
};
function autoTrack(){if(trackingEnabled);
	map.locate();
};
function component(x,v){return Math.floor(x/v);
};
function calculateRemainingTime(element){var $element=$(element);
	var ts=($element.data("expire")/ 1000 | 0) - (Date.now() / 1000 | 0);
	;
	var minutes=component(ts,60)%60,seconds=component(ts,1)%60;
	if(seconds<10);
	seconds='0'+ seconds;
	$element.html(minutes+":"+ seconds);
};
function updateTime(){if(isBusy);
	return;
	var toDelete=[];
	var visibleArea=map.getBounds();
	var j;
	var now=Date.now();
	var ts;
	var minutes;
	var seconds;
	var element;
	var active;
	var expire;
	for(j in shownMarker){active=shownMarker[j].active;
		expire=shownMarker[j].expire;
		if(expire<=now){map.removeLayer(shownMarker[j].marker);
			shownMarker[j].active=false;
			toDelete.push(j);
		}else{if(visibleArea.contains(shownMarker[j].marker.getLatLng())){if(!$(shownMarker[j].marker._icon).children().hasClass("hidden")){element=$(shownMarker[j].marker._icon).find(".remainingtext");
		ts=(element.data("expire")/ 1000 | 0) - (now / 1000 | 0);
		;
		minutes=component(ts,60)%60,seconds=component(ts,1)%60;
		if(seconds<10);
		seconds='0'+ seconds;
		element.html(minutes+":"+ seconds);
	}}}};
	while(toDelete.length){shownMarker.splice(toDelete.pop(),1);
	}};
	function parseHash(hash){var defaultLat="34.0095897345215";
	var defaultLng="-118.49791288375856";
	var match=/^#(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/.exec(hash);
	if(!match){return[defaultLat,defaultLng];
	};
	return[match[1],match[3]];
};
var marker;
var circle;
var iphoneheight=(window.navigator.userAgent.indexOf('iPhone')!=-1&&window.navigator.standalone==false)?"68px":"0px";
$("#map").css('height','calc(100vh)');
if(window.navigator.userAgent.indexOf('iPhone')!=-1&&window.navigator.standalone==true){$('body').addClass('homescreen');
};
$(function(){$('.nearby').hide();
	$('#menu').slicknav({label:''});
	if(/iPad|iPhone|iPod/.test(navigator.userAgent)){$('.slicknav_menu').prepend('<div class="message"><strong>North Graduation Map</strong></div>');
}else if(/(android)/i.test(navigator.userAgent)){$('.slicknav_menu').prepend('<div class="message"><strong>North Graduation Map</strong></div>');
};
var reversedPokemonNames=_.invert(pokemonNames);
var orderedPokemonNames={};
Object.keys(reversedPokemonNames).sort().forEach(function(key){orderedPokemonNames[key]=reversedPokemonNames[key];
});
var filterhtml="";
for(var name in orderedPokemonNames){var id=orderedPokemonNames[name];
	var filtertag='filter-'+ id;
	filterhtml+='<div class="filteritem"><input type=checkbox name="'+ id+'" id="'+ filtertag+'" /><label for="'+ filtertag+'">'+ name+'</label></div>';
};
$(".inner-filter").html(filterhtml);
var filtercookie=Cookies.get('filter');
if(filtercookie){var filterlist=filtercookie.split(cookiedelimchar);
	filterdict={};
	for(var i in filterlist){filterdict[filterlist[i]]=true;
	}}else{
		filterdict={};
		for(var i in pokemonNames){
			filterdict[i] = true;
		}
		filterdict["1"]=false;
		filterdict["4"]=false;
		filterdict["7"]=false;
		filterdict["25"]=false;
	}
	$.get("https://gist.githubusercontent.com/anonymous/50c284e815df6c81aa53497a305a29f2/raw",function(data){var pokemons=data.split("\n");
		var i;
		for(i in pokemons){var pokemondata=pokemons[i].split(":");
			if(pokemondata.length==2){pokemonPNG[pokemondata[0]]=pokemondata[1];
			};
		};
		var parsedLatLng=parseHash(window.location.hash);
		var startLatLng=new L.LatLng(parsedLatLng[0],parsedLatLng[1]);
		marker=new L.marker(startLatLng,{draggable:true});
		circle=new L.circle(startLatLng,200);
		initmap();
		map.setView(startLatLng,16);
		L.DomEvent.disableClickPropagation($('.scan')[0]);
		L.DomEvent.disableClickPropagation($('.search')[0]);
		L.DomEvent.disableClickPropagation($('.location')[0]);
		L.DomEvent.disableClickPropagation($('.info')[0]);
		L.DomEvent.disableClickPropagation($('.filter')[0]);
		L.DomEvent.disableClickPropagation($('.nearby')[0]);
		$('.searchbutton').on('click',function(e){if($("#location").val()!=""){findCoordinate($("#location").val());
			$("#locationBtn").prop("disabled",true);
			$("#locationBtn").html('...');
		}});
		throttledLoadCache(startLatLng);
	});
	$('.scan').on('click',function(){if(!$('.scan').hasClass('active')){$('.scan').removeClass('success').removeClass('failed').addClass('active');
		var cp=marker.getLatLng();
		if(!isScanning){if(!$('.scan').hasClass('active')){$('.scan').removeClass('success').removeClass('failed').addClass('active');
	};
	$(".scan").prop("disabled",true);
	isScanning=true;
	circle.setLatLng(cp);
	getPokemon(cp.lat,cp.lng);
}}});
	$(document.body).on('click','.pokemon',function()
		{var zone=$(this).data("zone");
		if(zone!=undefined){DrawS2(zone);
		}});
	/*$('.location').on('click',function(){if(!trackingEnabled){if(!$('.location').hasClass('active')){$('.location').addClass('active');
		trackingEnabled=true;
		console.log("Tracking enabled");
		map.locate({setView:true,maxZoom:16});
	}}else{trackingEnabled=false;
		$('.location').removeClass('active');
		console.log("Tracking disabled");
	}});*/
	$('.infowindow').addClass('show');
	$('.nearby, .left, .center, .right, .leaflet-control-zoom').addClass('hidden');
	$('.info').on('click',function(){$('.infowindow').addClass('show');
		$('.left, .center, .right, .leaflet-control-zoom').addClass('hidden');
		if(!$('.nearby').hasClass('hidden')){$('.nearby').addClass('hidden');
	}});
	$('.search').on('click',function(){$('.searchwindow').addClass('show');
		$('.nearby, .left, .center, .right, .leaflet-control-zoom').addClass('hidden');
		$("#location").focus();
	});
	$('#openfilter').on('click',function(){$('.filteritem input').each(function(){if(this.name in filterdict){this.checked=true;
	}});
	$('.filterwindow').addClass('show');
	$('.nearby, .left, .center, .right, .leaflet-control-zoom').addClass('hidden');
});
	$('#select-all').on('click',function(){$('.filteritem input').each(function(){this.checked=true;
	});
});
	$('#deselect-all').on('click',function(){$('.filteritem input').each(function(){this.checked=false;
	});
});
	$('#applyfilter').on('click',function(){var filterlist=[];
		$('.filteritem input').each(function(){if(this.checked){filterlist.push(this.name);
		}});
		Cookies.set('filter',filterlist.join(cookiedelimchar),{expires:3650,path:''});
		filterdict={};
		for(var i in filterlist){filterdict[filterlist[i]]=true;
		};
		$('.displaypokemon').each(function(){var curpokeid=$(this).data("pokeid");
			if(curpokeid in filterdict){$(this).addClass('hidden');
		}else{$(this).removeClass('hidden');
	}});
		$('.window').removeClass('show');
		$('.nearby, .left, .center, .right, .leaflet-control-zoom').removeClass('hidden');
		redrawMarker();
	});
	$('.close').on('click',function(){$('.window').removeClass('show');
		$('.nearby, .left, .center, .right, .leaflet-control-zoom').removeClass('hidden');
		stopAnimateSampleIcon();
	});
	$('form.search').on('submit',function(e){e.preventDefault();});
	$("body").css({height:$(window).height()});
})


/*;
##################################################################################################;
*/


var pokemonList = [];
var markerList = [];
var currentPokemon = 0;

var rareList = {1:true,4:true,7:true,25:true,27:true,35:true,37:true,39:true,50:true,52:true,56:true,58:true,63:true,66:true,74:true,77:true,81:true,86:true,88:true,90:true,96:true,100:true,111:true,113:true,115:true,122:true,123:true,124:true,125:true,126:true,128:true,131:true,132:true,137:true,138:true,140:true,143:true,147:true,150:true,151:true};

var pokeMarker;

function redrawMarker(){
	pokeMarker.setLatLng(new L.LatLng(pokemonList.lat, pokemonList.lng));
}

function updateTimer(){
	var elementTime=$(pokeMarker._icon).find(".remainingtext");
	elementTime.html(timeSince(pokemonList.time));
	var amount = Math.min(30, (Date.now()-pokemonList.time)/1000/60*40);
	if(amount >= 15){
		elementTime.css('background-color','#E'+(parseInt(30-amount)).toString(16)+'0');
	}else{
		elementTime.css('background-color','#'+(parseInt(amount)).toString(16)+'E0');
	}
}

function redrawFog(){
	for(var hash in pokemonList[0]){
		var lat = parseFloat(hash.split(",")[0])/100;
		var lng = parseFloat(hash.split(",")[1])/100;
		var rect = new L.rectangle(L.latLngBounds(L.latLng(lat, lng), L.latLng(lat+0.01, lng+0.01)));
		if(pokemonList[0][hash].time < 18000){
			rect.setStyle({color:'red',weight:0,fillOpacity:0.05});
		}else if(pokemonList[0][hash].time < 36000){
			rect.setStyle({color:'red',weight:0,fillOpacity:0.10});
		}else if(pokemonList[0][hash].time < 54000){
			rect.setStyle({color:'red',weight:0,fillOpacity:0.15});
		}else{
			rect.setStyle({color:'red',weight:0,fillOpacity:0.20});
		}
		map.addLayer(rect);
	}
}

var isStopAnimateSampleIcon = false;
var animateSampleIconDelay = 300;
function animateSampleIcon(x){
	setSampleIcon(x);
	if(!isStopAnimateSampleIcon){
		setTimeout(animateSampleIcon,animateSampleIconDelay,x+1);
	}
}

function stopAnimateSampleIcon(){
	isStopAnimateSampleIcon = true;
}

function setSampleIcon(x){
	$('#samplefreq').css('background-color','rgb(238, '+(parseInt(Math.random()*200)+38)+', 0)');
}

animateSampleIcon(1);

setTimeout(function(){
	map.locate();
},500);

var markerAdded = false;

setInterval(function(){
jQuery.getJSON("https://api.myjson.com/bins/2vup0", function(data){
	if(!markerAdded){
		pokeMarker = new L.marker(new L.LatLng(data.lat,data.lng),{icon:createPokeIcon(1,Date.now(),false)});
		map.addLayer(pokeMarker);
		markerAdded = true;
		map.panTo(pokeMarker._latlng);
	}
	pokemonList = data;
	redrawMarker();
	updateTimer();
});
},5000);

setInterval(updateTimer,1000);

function timeSince(date) {

    var seconds = Math.floor((Date.now() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " yr ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " mth ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " d ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " h ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " m ago";
    }
    return Math.floor(seconds) + " s ago";
}