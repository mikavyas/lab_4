/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWlrYXZ5YXMiLCJhIjoiY2xoczhjcDR1MGZqMzNjcW1scm1paTRpNyJ9.yYDAti9jKKB23RGPg8SeRA'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mikavyas/clhsa4wxx00xt01pf6eb5by8x',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 12 // starting zoom level
});

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
// Create a map load event handler
map.on('load', function() {
  let collisionData;
  
  // Fetch GeoJSON data from the online repository
  fetch('https://raw.githubusercontent.com/mikavyas/lab_4_test/master/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(data => {
      // Store the fetched data in the collisionData variable
      collisionData = data;

      // Use Turf.js envelope method to create a bounding box around the collision point data
      const bbox = turf.envelope(collisionData);

      // Create a feature collection from the bounding box
      const bboxFeature = turf.featureCollection([bbox]);

      // View the bounding box on the map
      map.addSource('bbox-source', {
        type: 'geojson',
        data: bboxFeature
      });

      map.addLayer({
        id: 'bbox-layer',
        type: 'line',
        source: 'bbox-source',
        paint: {
          'line-color': '#FF0000',
          'line-width': 2
        }
      });

      // Access the coordinates of the bounding box
      const minX = bbox.geometry.coordinates[0][0][0];
      const minY = bbox.geometry.coordinates[0][0][1];
      const maxX = bbox.geometry.coordinates[0][2][0];
      const maxY = bbox.geometry.coordinates[0][2][1];

      // Scale the bounding box by 10%
      const scaleFactor = 1.1;
      const scaledBbox = turf.transformScale(bbox, scaleFactor);

      // Create an array variable to store the scaled bounding box coordinates
      const bboxCoords = [scaledBbox.geometry.coordinates[0][0][0], scaledBbox.geometry.coordinates[0][0][1], scaledBbox.geometry.coordinates[0][2][0], scaledBbox.geometry.coordinates[0][2][1]];

      // Create a hexgrid inside the spatial limits of the scaled bounding box
      const hexgrid = turf.hexGrid(bboxCoords, 0.5, { units: 'kilometers' });

      // View the hexgrid on the map
      map.addSource('hexgrid-source', {
        type: 'geojson',
        data: hexgrid
      });

      map.addLayer({
        id: 'hexgrid-layer',
        type: 'fill',
        source: 'hexgrid-source',
        paint: {
          'fill-color': '#008000',
          'fill-opacity': 0.5
        }
      });
    })
    .catch(error => console.error('Error fetching data:', error));
});
/*--------------------------------------------------------------------
    Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/
//HINT: All code to create and view the hexgrid will go inside a map load event handler
//      First create a bounding box around the collision point data then store as a feature collection variable
//      Access and store the bounding box coordinates as an array variable
//      Use bounding box coordinates as argument in the turf hexgrid function



/*--------------------------------------------------------------------
Step 4: AGGREGATE COLLISIONS BY HEXGRID
--------------------------------------------------------------------*/
//HINT: Use Turf collect function to collect all '_id' properties from the collision points data for each heaxagon
//      View the collect output in the console. Where there are no intersecting points in polygons, arrays will be empty



// /*--------------------------------------------------------------------
// Step 5: FINALIZE YOUR WEB MAP
// --------------------------------------------------------------------*/
//HINT: Think about the display of your data and usability of your web map.
//      Update the addlayer paint properties for your hexgrid using:
//        - an expression
//        - The COUNT attribute
//        - The maximum number of collisions found in a hexagon
//      Add a legend and additional functionality including pop-up windows


