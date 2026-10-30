// Create the Leaflet map and load the stops GeoJSON data.

// Create the map inside the HTML element with id="map".
// preferCanvas improves performance when many point features are displayed.
const map = L.map('map', { preferCanvas: true }).setView([45.55, -73.7], 10);

// Add OpenStreetMap as the background tile layer.
const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 15,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

streets.addTo(map);

let boroughFeatures = [];
let selectedBorough = '';
let placeCategories;
let placesData;
let boroughLayer;
let boroughDensity = {};

const categoryColors = {
  'Parks and gardens': '#32d515aa',
  'Sports and recreation': '#e27f39',
  'Arts, culture and community': '#800020'
};


// For a NUMBER: one colour per class, light to dark.
function colourFor(value) {
  if (value >= 100) return '#800020';
  if (value >= 50)  return '#a94442';
  if (value >= 20)  return '#cc7a7a';
  if (value > 0)    return '#e6b8b8';
  return '#f2dede';
}


function getBoroughColor(borough) {
  return colourFor(boroughDensity[borough] || 0);
}

function updateBoroughStyles() {
  if (boroughLayer && Object.keys(boroughDensity).length) {
    boroughLayer.setStyle(function (feature) {
      return {
        color: '#0c0c0c',
        weight: 1.5,
        fillColor: getBoroughColor(feature.properties.NOM),
        fillOpacity: 0.90
      };
    });
  }
}

function calculateBoroughDensity(features) {
  boroughDensity = {};
  boroughFeatures.forEach(function (feature) {
    boroughDensity[feature.properties.NOM] = 0;
  });

  features.forEach(function (feature) {
    if (feature.properties.types !== 'Arts, culture and community') {
      return;
    }

    (feature.properties.arrondissements || '').split(',').forEach(function (name) {
      const borough = name.trim();
      if (Object.prototype.hasOwnProperty.call(boroughDensity, borough)) {
        boroughDensity[borough] += 1;
      }
    });
  });

  updateBoroughStyles();
}

function featureBelongsToBorough(feature, borough) {
  if (!borough) {
    return true;
  }

  return (feature.properties.arrondissements || '')
    .split(',')
    .map(function (name) {
      return name.trim();
    })
    .indexOf(borough) !== -1;
}

function getPlaceRadius(zoom) {
  return Math.max(3, Math.min(8, 14 - (zoom * 0.6)));
}

function updatePlacePointSizes() {
  if (!placeCategories) {
    return;
  }

  const radius = getPlaceRadius(map.getZoom());
  Object.keys(placeCategories).forEach(function (category) {
    placeCategories[category].eachLayer(function (layer) {
      if (layer.setRadius) {
        layer.setRadius(radius);
      }
    });
  });
}

function renderPlaceLayers() {
  if (!placesData || !placeCategories) {
    return;
  }

  Object.keys(placeCategories).forEach(function (category) {
    placeCategories[category].clearLayers();
    const categoryLayer = L.geoJSON(placesData, {
      filter: function (feature) {
        return feature.properties.types === category &&
          featureBelongsToBorough(feature, selectedBorough);
      },
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: getPlaceRadius(map.getZoom()),
          color: categoryColors[category],
          fillColor: categoryColors[category],
          fillOpacity: 1,
          weight: 1
        });
      },
      onEachFeature: function (feature, layer) {
        const p = feature.properties;
        layer.bindPopup(
          '<strong>' + (p.titre_lieu || 'Unnamed place') + '</strong><br>' +
          'Type: ' + (p.types || 'Not available') + '<br>' +
          'Address: ' + (p.adresse_principale || 'Not available') + '<br>' +
          'Borough: ' + (p.arrondissements || 'Not available') + '<br>' +
          'Description: ' + (p.description || 'Not available') + '<br>' +
          'Hours of Service: ' + (p.statut_ouverture || 'Not available') + '<br>' +
          'Website: ' + (p.url_fiche || 'Not available') + '<br>' +
          (p.url_fiche
            ? '<br><a href="' + p.url_fiche +
              '" target="_blank" rel="noopener">More information</a>'
            : '')
        );
      }
    });

    categoryLayer.eachLayer(function (layer) {
      placeCategories[category].addLayer(layer);
    });
  });
}

function zoomToBorough(borough) {
  if (!borough) {
    if (boroughFeatures.length) {
      map.fitBounds(L.geoJSON({
        type: 'FeatureCollection',
        features: boroughFeatures
      }).getBounds());
    }
    return;
  }

  const feature = boroughFeatures.find(function (boroughFeature) {
    return boroughFeature.properties.NOM === borough;
  });

  if (feature) {
    map.fitBounds(L.geoJSON(feature).getBounds(), {
      padding: [20, 20]
    });
  }
}

function addBoroughControl() {
  const control = L.control({ position: 'topright' });

  control.onAdd = function () {
    const container = L.DomUtil.create('div', 'borough-control');
    const label = L.DomUtil.create('label', '', container);
    const select = L.DomUtil.create('select', '', container);

    label.htmlFor = 'borough-select';
    label.textContent = 'Filter and zoom to borough';
    select.id = 'borough-select';

    const allOption = L.DomUtil.create('option', '', select);
    allOption.value = '';
    allOption.textContent = 'All boroughs';

    boroughFeatures.forEach(function (feature) {
      const option = L.DomUtil.create('option', '', select);
      option.value = feature.properties.NOM;
      option.textContent = feature.properties.NOM;
    });

    L.DomEvent.disableClickPropagation(container);
    L.DomEvent.on(select, 'change', function (event) {
      selectedBorough = event.target.value;
      renderPlaceLayers();
      zoomToBorough(selectedBorough);
    });

    return container;
  };

  control.addTo(map);
}

// MONTREAL BOROUGH BOUNDARIES: basemap and zoom targets
fetch('../mtl_bound.geojson')
  .then(function (response) {
    if (!response.ok) {
      throw new Error(
        'HTTP ' + response.status + ' loading mtl_bound.geojson'
      );
    }

    return response.json();
  })
  .then(function (data) {
    boroughFeatures = data.features;
    if (placesData) {
      calculateBoroughDensity(placesData.features);
    }

    boroughLayer = L.geoJSON(data, {
      style: function (feature) {
        return {
          color: '#1F2D5A',
          weight: 1.5,
          fillColor: Object.keys(boroughDensity).length
            ? getBoroughColor(feature.properties.NOM)
            : '#159aed',
          fillOpacity: Object.keys(boroughDensity).length ? 0.65 : 0.2
        };
      },
      onEachFeature: function (feature, layer) {
        layer.bindTooltip(feature.properties.NOM, {
          sticky: true
        });

        layer.on('click', function () {
          selectedBorough = feature.properties.NOM;
          const boroughSelect = document.getElementById('borough-select');

          if (boroughSelect) {
            boroughSelect.value = selectedBorough;
          }

          renderPlaceLayers();
          zoomToBorough(selectedBorough);
        });
      }
    });

    boroughLayer.addTo(map);

    addBoroughControl();
  })
  .catch(function (err) {
    document.getElementById('status').textContent +=
      '<br>Could not load mtl_bound.geojson.';

    console.error(err);
  });

// Display all features in the GeoJSON file.
const LIMIT = Infinity;

// Reusable colors for feature categories.
const colours = { 'Arts, Culture and Community Centers': '#800020',  'Parks and gardens': '#32d515aa', 'Sports and recreation': '#e27f39', 'Transit Bus Lines': '#c7a079', ' Transit Bus Stops': '#82816f2d' };

const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  const categoryItems = Object.keys(colours).map(function (k) {
    return '<span style="background:' + colours[k] + '"></span>' + k;
  }).join('<br>');
  const densityRows = [
    [100, '100 or more'],
    [50, '50 to 99'],
    [20, '20 to 49'],
    [1, '1 to 19'],
    [0, 'None']
  ];
  const densityItems = densityRows.map(function (row) {
    return '<i style="background:' + colourFor(row[0]) +
      '"></i>' + row[1];
  }).join('<br>');

  div.innerHTML =
    '<strong>Community centres per borough</strong><br>' +
    densityItems +
    '<br><strong>Map categories</strong><br>' +
    categoryItems;
  return div;
};

legend.addTo(map);



// STOPS DATA: shows all MTL bus stop locations
// Request the stops GeoJSON and route-point CSV from the repository root.
Promise.all([
  fetch('../stops_clean_output.geojson'),
  fetch('../shapes.csv')
])
  .then(function (responses) {
    responses.forEach(function (response) {
      if (!response.ok) {
        throw new Error(
          'HTTP ' + response.status + ' loading transit data'
        );
      }
    });

    return Promise.all([
      responses[0].json(),
      responses[1].text()
    ]);
  })
  .then(function (datasets) {
    const stopsData = datasets[0];
    const shapeRows = datasets[1].trim().split(/\r?\n/);
    const shapeHeaders = shapeRows.shift().split(',');
    const shapesData = {
      features: shapeRows.filter(Boolean).map(function (row) {
        const values = row.split(',');
        const properties = {};

        shapeHeaders.forEach(function (header, index) {
          properties[header] = values[index];
        });

        return {
          type: 'Feature',
          properties: properties,
          geometry: {
            type: 'Point',
            coordinates: [
              Number(properties.shape_pt_lon),
              Number(properties.shape_pt_lat)
            ]
          }
        };
      })
    };

    // Limit the features that will be displayed.
    const shown = {
      type: 'FeatureCollection',
      features: stopsData.features.slice(0, LIMIT)
    };

    // Convert the STOPS GeoJSON features into a Leaflet layer.
    const stopsLayer = L.geoJSON(shown, {
      // Draw each stop as a small circle instead of a default map pin.
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          color: '#82816f2d',
          radius: 1,
          fillOpacity: 0.5,
          weight: 1,
          // Use a category color when available; otherwise use gray.
          fillColor: '#82816f2d',
        });
      },
      // Add a popup using properties stored in each GeoJSON feature.
      onEachFeature: function (feature, layer) {
        const p = feature.properties;
        layer.bindPopup('<strong>' + p.stop_name + '</strong><br>' +
          'ID: ' + p.stop_id);
      }
    });

    stopsLayer.addTo(map);

    // Report how many features were displayed.
    document.getElementById('status').textContent =
      shown.features.length + ' of ' + stopsData.features.length + ' stops shown';

    // Build the transit route layer from the second dataset.
    const grouped = {};

    shapesData.features.forEach(function (feature) {
      const properties = feature.properties;
      const shapeId = properties.shape_id;

      if (!grouped[shapeId]) {
        grouped[shapeId] = [];
      }

      grouped[shapeId].push(feature);
    });

    const lineFeatures = Object.keys(grouped).map(function (shapeId) {
      const shapePoints = grouped[shapeId].sort(function (a, b) {
        return Number(a.properties.shape_pt_sequence) -
          Number(b.properties.shape_pt_sequence);
      });

      return {
        type: 'Feature',
        properties: {
          shape_id: shapeId
        },
        geometry: {
          type: 'LineString',
          coordinates: shapePoints.map(function (feature) {
            return feature.geometry.coordinates;
          })
        }
      };
    });

    const shapesLayer = L.geoJSON({
      type: 'FeatureCollection',
      features: lineFeatures
    }, {
      style: function () {
        return {
          color: '#c7a079',
          weight: 0.3,
          opacity: 0.5
        };
      },

      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          '<strong>Shape: ' +
          feature.properties.shape_id +
          '</strong>'
        );
      }
    });

    shapesLayer.addTo(map);

    document.getElementById('status').textContent +=
      '<br>' + lineFeatures.length + ' transit shapes displayed';
  })
  .catch(function (err) {
    document.getElementById('status').textContent +=
      '<br>Could not load transit data. Open the console (F12) for details.';

    console.error(err);
  });

//-------------------------------------------
// MONTREAL PLACES DATA: shows POI in Montreal

fetch('../mtl_places_clean_output.geojson')
  .then(function (response) {
    if (!response.ok) {
      throw new Error(
        'HTTP ' + response.status + ' loading mtl_places_clean_output.geojson'
      );
    }

    return response.json();
  })
  .then(function (data) {
    placesData = {
      type: 'FeatureCollection',
      features: data.features.slice(0, LIMIT)
    };
    calculateBoroughDensity(placesData.features);

    const parksLayer = L.layerGroup();
    const sportsLayer = L.layerGroup();
    const communityCentresLayer = L.layerGroup();

    placeCategories = {
      'Parks and gardens': parksLayer,
      'Sports and recreation': sportsLayer,
      'Arts, culture and community': communityCentresLayer
    };

    Object.keys(placeCategories).forEach(function (category) {
      placeCategories[category].addTo(map);
    });

    map.on('zoomend', updatePlacePointSizes);
    renderPlaceLayers();

    L.control.layers(
      { 'Streets': streets },
      {
        'Parks and gardens': parksLayer,
        'Sports and recreation': sportsLayer,
        'Community centres': communityCentresLayer
      },
      {
        collapsed: false,
        position: 'topleft'
      }
    ).addTo(map);

    document.getElementById('status').textContent =
      placesData.features.length + ' of ' + data.features.length + ' places shown';
  })
  .catch(function (err) {
    document.getElementById('status').textContent =
      'Could not load mtl_places_clean_output.geojson. Open the console (F12) for details.';

    console.error(err);
  });
