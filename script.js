/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Access token 
mapboxgl.accessToken = 'pk.eyJ1IjoibWlrYXZ5YXMiLCJhIjoiY2xoczhjcDR1MGZqMzNjcW1scm1paTRpNyJ9.yYDAti9jKKB23RGPg8SeRA'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map 
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/mikavyas/clhsa4wxx00xt01pf6eb5by8x',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 12 // starting zoom level
});

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
// Map load event handler
map.on('load', function() {
    let collisionData;
    
    // Fetch GeoJSON data from online repository (raw)
    fetch('https://raw.githubusercontent.com/mikavyas/lab_4/main/pedcyc_collision_06-21.geojson')
        .then(response => response.json())
        .then(data => {
            // Store in collisionData variable
            collisionData = data;

            // Turf.js envelope method to create a bounding box around the collision point data
            const bbox = turf.envelope(collisionData);

            // Feature collection created from bounding box
            const bboxFeature = turf.featureCollection([bbox]);

            // View bounding box on map
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

            // Access coordinates of bounding box
            const minX = bbox.geometry.coordinates[0][0][0];
            const minY = bbox.geometry.coordinates[0][0][1];
            const maxX = bbox.geometry.coordinates[0][2][0];
            const maxY = bbox.geometry.coordinates[0][2][1];

            // Scale (bounding box) by 10%
            const scaleFactor = 1.1;
            const scaledBbox = turf.transformScale(bbox, scaleFactor);

            // Store scaled bounding box coordinates
            const bboxCoords = [scaledBbox.geometry.coordinates[0][0][0], scaledBbox.geometry.coordinates[0][0][1], scaledBbox.geometry.coordinates[0][2][0], scaledBbox.geometry.coordinates[0][2][1]];

            // Create a hexgrid 
            const hexgrid = turf.hexGrid(bboxCoords, 0.5, { units: 'kilometers' });

            // View hexgrid on map
            map.addSource('hexgrid-source', {
                type: 'geojson',
                data: hexgrid
            });

            map.addLayer({
                id: 'hexgrid-layer',
                type: 'fill',
                source: 'hexgrid-source',
                paint: {
                    // Update paint properties based on collision data range
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['coalesce',['get', 'COUNT'],-1],
                        -1, '#cccccc',
                        0, '#ffffff',  
                        1, '#ff0000'   
                    ],
                    'fill-opacity': 0.7
                }
            });

            /*--------------------------------------------------------------------
            Step 4: AGGREGATE COLLISION DATA BY HEXGRID
            --------------------------------------------------------------------*/
            // Aggregate collision data by hexgrid using Turf collect method
            const collishex = turf.collect(hexgrid, collisionData, '_id', 'values');

            // Initialize variable to store maximum collision count
            let maxcollis = 0;

            // Iterate through features to add point (COUNT) and identify maximum number of collisions
            collishex.features.forEach((feature) => {
                // Add point (COUNT) to each hexagon
                feature.properties.COUNT = feature.properties.values.length;

                // Identify maximum number of collisions
                if (feature.properties.COUNT > maxcollis) {
                    maxcollis = feature.properties.COUNT;
                }
            });

            // Log the maximum collision count
            console.log('Maximum collision count:', maxcollis);

            /*--------------------------------------------------------------------
            Step 5: LEGEND
            --------------------------------------------------------------------*/
            // Legend
            const legend = document.createElement('div');
            legend.innerHTML = `
                <h4>Collision Data Legend</h4>
                <div><span style="background-color: #ffffff;"></span>No Collisions</div>
                <div><span style="background-color: #ff0000;"></span>Maximum Collisions</div>
            `;
            legend.style.padding = '10px';
            legend.style.backgroundColor = '#ffffff';
            legend.style.borderRadius = '5px';
            legend.style.position = 'absolute';
            legend.style.top = '10px';
            legend.style.left = '10px';
            legend.style.zIndex = '1';
            map.getContainer().appendChild(legend);

            /*--------------------------------------------------------------------
            Step 6: FUNCTIONALITY
            --------------------------------------------------------------------*/
            // Pop-up windows for each hexagon
            map.on('click', 'hexgrid-layer', function(e) {
                const features = map.queryRenderedFeatures(e.point, { layers: ['hexgrid-layer'] });
                const feature = features[0];

                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`<h3>Collision Count: ${feature.properties.COUNT}</h3>`)
                    .addTo(map);
            });

            // Edit cursor 
            map.on('mouseenter', 'hexgrid-layer', function() {
                map.getCanvas().style.cursor = 'pointer';
            });

            // Change cursor back to default when not in hover 
            map.on('mouseleave', 'hexgrid-layer', function() {
                map.getCanvas().style.cursor = '';
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

