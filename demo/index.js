import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js'
import {fromLonLat} from 'ol/proj';
import LineString from 'ol/geom/LineString';
import Feature from 'ol/Feature';
import {Style, Stroke} from 'ol/style';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([121.241212, 30.339369]),
    zoom: 15
  })
});


// var vectorLayer = new VectorLayer({
//   source: new VectorSource({
//     url: 'data/geojson/countries.geojson',
//     format: new GeoJSON()
//   }),
//   style: function(feature) {
//     style.getText().setText(feature.get('name'));
//     return style;
//   }
// });

// map.addLayer(vectorLayer);
