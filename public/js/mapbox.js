/* eslint-disable */
'use-strict';

export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1Ijoia3VydGt1cnQwMyIsImEiOiJja3I0amJnMDkyeDBlMnVtbjZpeGZ4bGZhIn0.FQ8ECnntJLQfXotpQXhFwA';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kurtkurt03/ckr4m2cmu0kyu17monbysjroq',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // CREATE MARKER
    const el = document.createElement('div');
    el.className = 'marker';

    // ADD MARKER
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // ADD POP UP
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
      .addTo(map);

    // EXTENDS MAP BOUNDS TO INCLUDES CURRENT LOCATION
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
