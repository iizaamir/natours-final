/* eslint-disable */
// const locations = JSON.parse(document.getElementById('map').dataset.locations);
const mapBox = document.getElementById('map');
// // console.log(locations)

const displayMap = (locations) => { //take the array of locations

mapboxgl.accessToken = 'pk.eyJ1IjoiaWl6YWFtaXIiLCJhIjoiY2s4MnFiNXI3MDJpcDNmb2RoYnc4MzBjbiJ9._1NYV5jfIinPHbGdLfdN-g';
var map = new mapboxgl.Map({
    container: 'map', //put the map on an element with the id of map
    style: 'mapbox://styles/iizaamir/ck8u5gk6u0rpr1io4ffn5oukl',
    scrollZoom: false //disable the zoom functionality
    // center: [-118.113491,34.111745],
    // zoom: 10,
    // interactive: false
});
//Automatically figureout the position of map based on tour location points.
//so need to put all the locations for a certain tour on map
const bounds = new mapboxgl.LngLatBounds(); //bounds in the area that is displayed on the map
//Loop through the locations and add a marker for each of them
locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';
    // Add merker
    new mapboxgl.Marker({
        element: el, 
        anchor: 'bottom' //bottom of that element(that pin) points to exact location
    }).setLngLat(loc.coordinates).addTo(map);  //set the gps coordinates of the marker, coordinates is an array of 
    //longitude and latitude.
    //Add popup
    new mapboxgl.Popup({offset:30})
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

    //Extend map bounds to include current locations.
    bounds.extend(loc.coordinates);
});
//map actually fits the bounds.
map.fitBounds(bounds,{
    padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
        }
});
};

const mapBox1 = document.getElementById('map');
if (mapBox1) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}