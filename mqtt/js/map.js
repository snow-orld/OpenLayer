/*
 * FILE: map.js
 *
 * osm layer plus car gps tracks on the base layer
 *
 * author: Xueman Mou
 * date: 7/23/18
 * version: 1.0.0
 * modified: 7/25/18 17:11:00 GMT +0800
 * 
 */

/*
 * @Function lineStyle: define the stroke style of a car trace
 * @param color: the rgb color of the stroke
 * @param width: the width of the stroke
 */
function lineStyle(color, width) {
	return new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: color,
			width: width
		}),
		fill: new ol.style.Fill({
			color: color
		})
	});
}

/*
 * @Function vectorSource: return a new vectorSource with none features
 */
function vectorSource() {
	return new ol.source.Vector({
		// features: [feature]
	});
}

/*
 * @Function vectorLayer: return a new vectorLayer with specified source and line style
 */
function vectorLayer(source, style) {
	return new ol.layer.Vector({
		source: source,
		style: [style]
	});
}

/*
 * @Function baseMap: return a new map with osm as base layer, with specified center [lon, lat] and zoom level
 * @param center: array of center position [lon, lat]
 * @param zoom: initial zoom level
 */
function baseMap(center, zoom) {
	var osm = new ol.layer.Tile({
		source: new ol.source.OSM()
	});
	var map = new ol.Map({
		layers: [osm],
		target: 'map',
		view: new ol.View({
			center: ol.proj.fromLonLat(center),
			zoom: zoom
		})
	});
	return map;
}

function staticImageMap() {
	var extent = [0, 0, 1440, 900];
	var projection = new ol.proj.Projection({
		code: 'xkcd-image',
		units: 'pixels',
		extent: extent
	});
	var map = new ol.Map({
		layers: [
			new ol.layer.Image({
				source: new ol.source.ImageStatic({
					attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
					url: '../img/googlemap.png',
					projection: projection,
					imageExtent: extent
				})
			})
		],
		target: 'map',
		view: new ol.View({
			projection: projection,
			// center: ol.proj.transform(ol.extent.getCenter(extent), 'EPSG:4326', 'EPSG:3857'),
			center: ol.extent.getCenter(extent),
			zoom: 2,
			maxZoom: 8
		})
	});
	return map;
}

function addImageLayer(map) {
	proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
          '+x_0=400000 +y_0=-100000 +ellps=airy ' +
          // '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
          '+units=m +no_defs');
	ol.proj.proj4.register(proj4);

	// var imageExtent = [13496162.443549074, 13497685.739461089, 3546487.37032546, 3547331.1612006268]
	// var imageExtent = [303334.75, 303400.17, 1212380.90, 1212517.74]
	// var imageExtent = [30.333475, 30.340017, 121.238090, 121.251774]
	var imageExtent = [0, 0, 1440, 803];
	// var imageExtent = [0, 0, 700000, 1300000];

	var layer = new ol.layer.Image({
		source: new ol.source.ImageStatic({
			// url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/' +
			// 	'British_National_Grid.svg/2000px-British_National_Grid.svg.png',
			url: '../img/googlemap.png',
			// crossOrigin: '',
			// projection: 'EPSG:27700',
			imageSize: [1440, 803],
			projection: 'EPSG:3857',
			imageExtent: imageExtent
		})
	});
	// map.getView().setCenter(ol.proj.transform(ol.extent.getCenter(imageExtent), 'EPSG:27700', 'EPSG:3857'));
	map.addLayer(layer);
}

function calculateCoords(coords) {
	transformed = ol.proj.transform(coords, 'EPSG:4326', 'EPSG:3857')
	console.log(transformed)
}

var drawCircleInMeter = function(map, center, radius) {
	var coordinate = center;
	// var dist = 50;
	// var source = vectorSource();
	// source.addFeature(new ol.Feature(new ol.geom.Point(coordinate)));
	// var style = new ol.style.Style({
	// 	fill: new ol.style.Fill({
	// 		color: 'rgba(255, 255, 255, 0.2)'
	// 	}),
	// 	image: new ol.style.Circle({
	// 		radius: radius,
	// 		stroke: new ol.style.Stroke({
	// 			color:'#fff'
	// 		}),
	// 		fill: new ol.style.Fill({
	// 			color: '#3399CC'
	// 		})
	// 	})
	// });
	var source = new ol.source.Vector({
		features: [new ol.Feature(new ol.geom.Point(coordinate))]
	})
	var vector = new ol.layer.Vector({
		source: source,
		style: new ol.style.Style({
			image: new ol.style.Circle({
				radius: radius,
				stroke: new ol.style.Stroke({
					color: '#fff'
				}),
				fill: new ol.style.Fill({
					color: '#3399CC'
				})
			})
		})
	});
	// var layer = vectorLayer(source, style);
	// map.addLayer(layer);
	map.addLayer(vector)

	// return map;
}

function drawOldTrace(map){
	var style = new ol.style.Style({
		stroke: new ol.style.Stroke({
		  color: '#ffcc33',
		  width: 2
		})
	});

	var source = new ol.source.Vector({
	// features: [feature]
	});
	var vector = new ol.layer.Vector({
		source: source,
		style: [style]
	});

	var coords = [];
	file = './data/trace2_clean.txt';
	try {
		// Internet Explorer
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = false;
		xmlDoc.load(file);
	} catch (e) {
	// Chrome, Safari
		xmlHttp = new window.XMLHttpRequest();
		xmlHttp.open("GET", file, false);
		xmlHttp.overrideMimeType('text/xml');
		xmlHttp.send(null);
		xmlDoc = xmlHttp.responseText;
	}

	data = xmlDoc.split('\n');
	if (data[data.length - 1] == "") {
		data = data.slice(0, -1)
	}

	lon_last = null;
	lat_last = null;

	for (var i = 0; i < data.length; i++) {
		lon = parseFloat(data[i].split(',')[0]);
		lat = parseFloat(data[i].split(',')[1]);

		// coords.push([lon, lat]);
		// WGS84 to psudo mercator
		coords[i] = ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857');
		var feature = new ol.Feature({
			geometry: new ol.geom.LineString(coords.slice(-2)),
			name: 'Line'
		});
		// source.addFeature(feature);
		source.addFeature(feature);
	}
	map.addLayer(vector);
}

// calculateCoords([121.238090, 30.333475])
// calculateCoords([121.251774, 30.340017])

var map = baseMap([121.241212, 30.339369], 12);
addImageLayer(map);
// var map = imageMap()

var client = mqtt.connect('ws://47.96.72.34:8080');
// var client = mqtt.connect('ws://localhost:3000');

// coords key is uuid of a car, value is the car's history position
var coords = [];
var vectorLayers = {};
var counter = 0;
// For every newly appearing car, build a new vector layer with different color

// drawCircleInMeter(map,[121.241212, 30.339369],50);
drawOldTrace(map);

var source = new ol.source.Vector();
var style = new ol.style.Style({
	stroke: new ol.style.Stroke({
		color: '#3399FF',
		width: 5
	})
});
var vector = new ol.layer.Vector({
	source: source,

	style: [style]
});
map.addLayer(vector);

client.on('connect', function(){
	client.subscribe('GPS/+');
});

client.on('message', function(topic, message){

	var msg = msgpack.decode(message);
	

	var timestamp = msg[0];
	var lon = msg[1] / 1000000;
	var lat = msg[4] / 1000000;

	var carid = topic.split('/')[1];

	// if (coords[carid] == undefined) {

	// 	coords[carid] = [];
	// 	coords[carid].push(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));

	// 	// new car
	// 	var source = vectorSource();
	// 	// color = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
	// 	var color = '#3399FF';
	// 	var style = lineStyle(color, 5);
	// 	var vector = vectorLayer(source, style);
	// 	// vector.getSource().addFeature(new ol.Feature(new ol.geom.Point(coords[carid][0])))
	
	// 	vectorLayers[carid] = vector;
	// 	map.addLayer(vector);

	// } else {
	// 	console.log(lon, lat);
	// 	coords[carid].push(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'))
	// 	vector = vectorLayers[carid];

	// 	var feature = new ol.Feature({
	// 		geometry: new ol.geom.LineString(coords.slice(-2)),
	// 		name: 'Line'
	// 	});
	// 	vector.getSource().addFeature(feature);
	// }
	
	coords.push(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));

	var feature = new ol.Feature({
		geometry: new ol.geom.LineString(coords.slice(-2)),
		name: 'Line'
	});
	
	source.addFeature(feature);

	counter = counter + 1;
	if (counter > 100) {
		client.end();
	}
});
