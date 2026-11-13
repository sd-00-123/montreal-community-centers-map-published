// Create the Leaflet map and load the stops GeoJSON data.

// Create the map inside the HTML element with id="map".
// preferCanvas improves performance when many point features are displayed.
const map = L.map('map', { preferCanvas: true }).setView([45.45, -73.7], 10.45);

// Support both the current root deployment and the legacy /site/ URL.
const dataRoot = window.location.pathname.includes('/site/') ? '../' : './';
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/@45.5409057,-73.7217907,11z?entry=ttu&g_ep=EgoyMDI2MTExMC4wIKXMDSoASAFQAw%3D%3D';
let dataLoadError = false;
let currentLanguage = 'en';
let stopFeatures = [];
let metroFeatures = [];
let lastRecommendationPoint;
let recommendationLayer = L.layerGroup().addTo(map);

const translations = {
  en: {
    title: 'Montreal Elderly Community and Recreation Centers / Places',
    mapDescription: 'Use the map controls to zoom and move around the map. Select a point or route to view more details. Use the map to identify the location of recreation and community centers and plan transit to these locations accordingly. For directions, click on a maroon dot or community center, scroll to the bottom of the opened page, and click "GET ITINERARY".',
    searchLabel: 'Search',
    searchPlaceholder: 'Search by name, borough, or postal code',
    searchAddressLoading: 'Looking up address...',
    searchAddressNotFound: 'Address not found',
    searchAddressError: 'Could not find that address',
    selectedPlace: 'Selected place',
    description: 'Description',
    accessibility: 'Accessibility',
    filterHeading: 'Map filters',
    boroughLabel: 'Filter and zoom to borough',
    allBoroughs: 'All boroughs',
    installationType: 'Installation type',
    parks: 'Parks and gardens',
    sports: 'Sports and recreation',
    community: 'Community centres',
    loadingMap: 'Loading map...',
    mapNote: 'This map is a basic version, with cleaned data and organised for bare minimum use. Future versions will hopefully include more detailed information about each Center, such as senior age ranges at comunity centers, and condition.',
    noMatch: 'No match',
    placesShown: 'places shown',
    hours: 'Hours of Service',
    address: 'Address',
    type: 'Type',
    installation: 'Installation',
    borough: 'Borough',
    website: 'Website',
    moreInformation: 'More information',
    weatherOnlyMontreal: 'Weather is available only on Montreal Island.',
    weatherLoading: 'Weather will load in 3 seconds...',
    weatherAt: 'Weather at',
    good: 'Good',
    caution: 'Caution',
    bad: 'Bad',
    temperature: 'Temperature',
    windSpeed: 'Wind speed',
    precipitation: 'Precipitation',
    snowfall: 'Snowfall',
    notAvailable: 'Not available',
    regularSchedule: 'Regular schedule',
    hoursDay: 'Day',
    hoursTime: 'Time',
    switchToFrench: 'Switch to French',
    switchToEnglish: 'Switch to English',
    boroughDensity: 'Community centres per borough'
    ,
    nearestOptions: 'Nearest Options',
    busStop: 'Bus stop',
    metroStation: 'Metro station',
    communityCentre: 'Community centre',
    park: 'Park',
    distance: 'Distance',
    nearestButton: 'For Nearest options',
    weatherButton: 'For wWather conditions',
    googleMapsButton: 'Get Directions'
  },
  fr: {
    title: 'Centres communautaires et de loisirs pour personnes âgées de Montréal / Lieux',
    mapDescription: 'Utilisez les commandes de la carte pour zoomer et vous déplacer. Sélectionnez un point ou un trajet pour voir plus de détails. Utilisez la carte pour trouver les centres de loisirs et communautaires et planifier votre trajet. Pour obtenir un itinéraire, cliquez sur un point bordeaux ou un centre communautaire, faites défiler jusqu’au bas de la page ouverte, puis cliquez sur « GET ITINERARY ».',
    searchLabel: 'Rechercher',
    searchPlaceholder: 'Rechercher par nom, arrondissement ou code postal',
    searchAddressLoading: 'Recherche de l’adresse...',
    searchAddressNotFound: 'Adresse introuvable',
    searchAddressError: 'Impossible de trouver cette adresse',
    selectedPlace: 'Lieu sélectionné',
    description: 'Description',
    accessibility: 'Accessibilité',
    filterHeading: 'Filtres de la carte',
    boroughLabel: 'Filtrer et zoomer sur un arrondissement',
    allBoroughs: 'Tous les arrondissements',
    installationType: 'Type d’installation',
    parks: 'Parcs et jardins',
    sports: 'Sports et loisirs',
    community: 'Centres communautaires',
    loadingMap: 'Chargement de la carte...',
    mapNote: 'Cette carte est une version de base, avec des données nettoyées et organisées pour une utilisation minimale. Les prochaines versions pourraient inclure plus de renseignements sur chaque centre, notamment les groupes d’âge et l’état des lieux.',
    noMatch: 'Aucun résultat',
    placesShown: 'lieux affichés',
    hours: 'Heures de service',
    address: 'Adresse',
    type: 'Type',
    installation: 'Installation',
    borough: 'Arrondissement',
    website: 'Site Web',
    moreInformation: 'Plus d’informations',
    weatherOnlyMontreal: 'La météo est disponible uniquement sur l’île de Montréal.',
    weatherLoading: 'La météo sera chargée dans 3 secondes...',
    weatherAt: 'Météo à',
    good: 'Bon',
    caution: 'Prudence',
    bad: 'Mauvais',
    temperature: 'Température',
    windSpeed: 'Vitesse du vent',
    precipitation: 'Précipitations',
    snowfall: 'Neige',
    notAvailable: 'Non disponible',
    regularSchedule: 'Horaire régulier',
    hoursDay: 'Jour',
    hoursTime: 'Heure',
    switchToFrench: 'Passer au français',
    switchToEnglish: 'Passer à l’anglais',
    boroughDensity: 'Centres communautaires par arrondissement'
    ,
    nearestOptions: 'Options d’urgence les plus proches',
    busStop: 'Arrêt d’autobus',
    metroStation: 'Station de métro',
    communityCentre: 'Centre communautaire',
    park: 'Parc',
    distance: 'Distance',
    nearestButton: 'Pour les options les plus proches',
    weatherButton: 'Pour les conditions météorologiques',
    googleMapsButton: 'Obtenir l’itinéraire'
  }
};

function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

function distanceInMetres(from, to) {
    const earthRadius = 6371000;
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;
    const deltaLat = (to.lat - from.lat) * Math.PI / 180;
    const deltaLon = (to.lng - from.lng) * Math.PI / 180;
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

function formatDistance(metres) {
    return metres < 1000
      ? Math.round(metres) + ' m'
      : (metres / 1000).toFixed(2) + ' km';
  }

function bearingBetween(from, to) {
  const latitude1 = from.lat * Math.PI / 180;
  const latitude2 = to.lat * Math.PI / 180;
  const deltaLongitude = (to.lng - from.lng) * Math.PI / 180;
  const y = Math.sin(deltaLongitude) * Math.cos(latitude2);
  const x = Math.cos(latitude1) * Math.sin(latitude2) -
    Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(deltaLongitude);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function updateNearestRecommendations(latlng, targetPanel) {
    lastRecommendationPoint = latlng;
    if (!stopFeatures.length || !placesData) {
      return;
    }

    recommendationLayer.clearLayers();
    const destinations = stopFeatures.map(function (feature) {
      return {
        feature: feature,
        latlng: L.latLng(
          Number(feature.geometry.coordinates[1]),
          Number(feature.geometry.coordinates[0])
        ),
        distance: distanceInMetres(latlng, {
          lat: Number(feature.geometry.coordinates[1]),
          lng: Number(feature.geometry.coordinates[0])
        }),
        label: feature.properties.stop_name || translate('busStop'),
        type: translate('busStop'),
        colour: '#2563eb'
      };
    }).sort(function (a, b) {
      return a.distance - b.distance;
    }).slice(0, 1);

    const metro = metroFeatures.map(function (feature) {
      const lat = Number(feature.geometry.coordinates[1]);
      const lng = Number(feature.geometry.coordinates[0]);
      return {
        feature: feature,
        latlng: L.latLng(lat, lng),
        distance: distanceInMetres(latlng, { lat: lat, lng: lng }),
        label: feature.properties.station || translate('metroStation'),
        type: translate('metroStation'),
        colour: '#f59e0b'
      };
    }).sort(function (a, b) {
      return a.distance - b.distance;
    })[0];

    const indoor = placesData.features.filter(function (feature) {
      return feature.properties.types === 'Arts, culture and community';
    }).map(function (feature) {
      const lat = Number(feature.geometry.coordinates[1]);
      const lng = Number(feature.geometry.coordinates[0]);
      return {
        feature: feature,
        latlng: L.latLng(lat, lng),
        distance: distanceInMetres(latlng, { lat: lat, lng: lng }),
        label: feature.properties.titre_lieu || translate('communityCentre'),
        type: translate('communityCentre'),
        colour: '#b91c1c'
      };
    }).sort(function (a, b) {
      return a.distance - b.distance;
    })[0];

    if (indoor) {
      destinations.push(indoor);
    }

    if (metro) {
      destinations.splice(1, 0, metro);
    }

    const park = placesData.features.filter(function (feature) {
      return feature.properties.types === 'Parks and gardens';
    }).map(function (feature) {
      const lat = Number(feature.geometry.coordinates[1]);
      const lng = Number(feature.geometry.coordinates[0]);
      return {
        feature: feature,
        latlng: L.latLng(lat, lng),
        distance: distanceInMetres(latlng, { lat: lat, lng: lng }),
        label: feature.properties.titre_lieu || translate('park'),
        type: translate('park'),
        colour: '#16803c'
      };
    }).sort(function (a, b) {
      return a.distance - b.distance;
    })[0];

    if (park) {
      destinations.push(park);
    }

    const list = destinations.map(function (destination) {
      recommendationLayer.addLayer(L.polyline(
        [latlng, destination.latlng],
        { color: destination.colour, weight: 3, opacity: 0.8 }
      ));
      const arrowAngle = bearingBetween(latlng, destination.latlng);
      const arrowPoint = L.latLng(
        (latlng.lat + destination.latlng.lat) / 2,
        (latlng.lng + destination.latlng.lng) / 2
      );
      recommendationLayer.addLayer(L.marker(arrowPoint, {
        icon: L.divIcon({
          className: 'recommendation-arrow',
          html: '<span style="color:' + destination.colour +
            '; transform:rotate(' + (arrowAngle - 90) + 'deg)">&#9654;</span>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        }),
        interactive: false
      }));
      const destinationMarker = L.circleMarker(destination.latlng, {
        radius: 9,
        color: destination.colour,
        fillColor: destination.colour,
        fillOpacity: 0.85,
        weight: 3
      });
      const destinationProperties = destination.feature.properties || {};
      destinationMarker.bindPopup(
        '<strong>' + escapeHtml(destination.label) + '</strong><br>' +
        escapeHtml(destination.type) +
        (destinationProperties.arrondissements
          ? '<br>' + translate('borough') + ': ' +
            escapeHtml(destinationProperties.arrondissements)
          : ''),
        { closeButton: true }
      );
      recommendationLayer.addLayer(destinationMarker);
      return '<li><span class="recommendation-line" style="border-color:' +
        destination.colour + '"></span><strong>' +
        escapeHtml(destination.type) + ':</strong> ' +
        escapeHtml(destination.label) + ' (' +
        escapeHtml(formatDistance(destination.distance)) + ')</li>';
    }).join('');

    const panel = targetPanel || document.getElementById('nearest-recommendations');
    if (panel) {
      panel.innerHTML = (targetPanel ? '' : '<h2>' + translate('nearestOptions') + '</h2>') +
        '<div>' + translate('distance') + ': ' +
        (currentLanguage === 'fr' ? 'distance à vol d’oiseau' : 'straight-line estimate') +
        '</div><ul>' + list + '</ul>';
      if (!targetPanel) {
        panel.hidden = false;
      }
    }
  }

function hideNearestRecommendations() {
  const panel = document.getElementById('nearest-recommendations');
  if (panel) {
    panel.hidden = true;
  }
  recommendationLayer.clearLayers();
}

function translate(key) {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('[data-i18n]').forEach(function (element) {
    element.textContent = translate(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
    element.placeholder = translate(element.dataset.i18nPlaceholder);
  });

  const button = document.getElementById('language-toggle');
  if (button) {
    button.textContent = currentLanguage === 'en' ? 'FR' : 'EN';
    button.setAttribute(
      'aria-label',
      currentLanguage === 'en' ? translate('switchToFrench') : translate('switchToEnglish')
    );
  }
}

function setupLanguageToggle() {
  const button = document.getElementById('language-toggle');
  if (!button) {
    return;
  }

  button.addEventListener('click', function () {
    currentLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    clearTimeout(weatherRequestTimer);
    map.closePopup();
    weatherPopup = null;
    weatherLoadingPopup = null;
    applyLanguage();
    renderPlaceLayers();
    updatePlaceCount();
    if (selectedPlaceFeature) {
      showPlaceDetails(selectedPlaceFeature);
    }
    if (lastRecommendationPoint) {
      updateNearestRecommendations(lastRecommendationPoint);
    }
    map.removeControl(legend);
    legend.addTo(map);
  });
  applyLanguage();
}

setupLanguageToggle();

function showDataLoadError(dataFile) {
  const status = document.getElementById('status');
  dataLoadError = true;

  if (status) {
    status.textContent = currentLanguage === 'fr'
      ? 'Le fichier de données ' + dataFile +
        ' n’a pas été chargé, car l’URL demandée est bloquée ou indisponible.'
      : 'The map data file ' + dataFile +
        ' did not load because the requested URL is blocked or unavailable.';
    status.classList.add('status-error');
  }
}

// Add OpenStreetMap as the background tile layer.
const streets = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 15,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

streets.addTo(map);

// Request current weather for Concordia's Hall Building when the map loads.
const hallBuilding = {
  name: 'Concordia, Hall building',
  lat: 45.4973,
  lon: -73.5790
};

const hallWeatherParams = new URLSearchParams({
  latitude: hallBuilding.lat,
  longitude: hallBuilding.lon,
  current: 'temperature_2m,wind_speed_10m'
});
const hallWeatherUrl =
  'https://api.open-meteo.com/v1/forecast?' + hallWeatherParams;
console.log(hallWeatherUrl);

fetch(hallWeatherUrl)
  .then(function (response) {
    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    return response.json();
  })
  .then(function (data) {
    console.log(
      'Now at ' + hallBuilding.name + ': ' +
      data.current.temperature_2m + ' degrees C'
    );
  })
  .catch(function (error) {
    console.log('Could not get it: ' + error.message);
  });

let weatherRequestTimer;
let weatherPopup;
let weatherLoadingPopup;
const weatherPopupMinimumZoom = 12;

map.on('zoomend', function () {
  if (weatherPopup && map.getZoom() < weatherPopupMinimumZoom) {
    map.closePopup(weatherPopup);
    weatherPopup = null;
  }
  if (weatherLoadingPopup && map.getZoom() < weatherPopupMinimumZoom) {
    map.closePopup(weatherLoadingPopup);
    weatherLoadingPopup = null;
  }
});

function assessWeather(current) {
  let score = 100;

  if (current.temperature_2m < -15 || current.temperature_2m > 35) {
    score -= 35;
  } else if (current.temperature_2m < -5 || current.temperature_2m > 30) {
    score -= 20;
  }

  if (current.wind_speed_10m > 50) {
    score -= 30;
  } else if (current.wind_speed_10m > 30) {
    score -= 20;
  }

  if (current.precipitation > 5 || current.snowfall > 2) {
    score -= 30;
  } else if (current.precipitation > 0 || current.snowfall > 0) {
    score -= 15;
  }

  if ([65, 67, 75, 82, 95, 96, 99].indexOf(current.weather_code) !== -1) {
    score -= 30;
  } else if (current.weather_code >= 51) {
    score -= 15;
  }

  score = Math.max(0, Math.min(100, score));

  let status = 'Good conditions';
  let statusClass = 'weather-good';
  if (score < 40) {
    status = 'Poor conditions';
    statusClass = 'weather-bad';
  } else if (score < 70) {
    status = 'Use caution';
    statusClass = 'weather-caution';
  }

  return {
    score: score,
    status: status,
    statusClass: statusClass
  };
}

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const intersects = ((ring[i][1] > point.lat) !== (ring[j][1] > point.lat)) &&
      point.lng < (ring[j][0] - ring[i][0]) *
      (point.lat - ring[i][1]) / (ring[j][1] - ring[i][1]) + ring[i][0];
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInPolygon(point, polygon) {
  if (!pointInRing(point, polygon[0])) {
    return false;
  }

  return !polygon.slice(1).some(function (hole) {
    return pointInRing(point, hole);
  });
}

function isOnMontrealIsland(latlng) {
  return boroughFeatures.some(function (feature) {
    const geometry = feature.geometry;
    if (geometry.type === 'Polygon') {
      return pointInPolygon(latlng, geometry.coordinates);
    }
    if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.some(function (polygon) {
        return pointInPolygon(latlng, polygon);
      });
    }
    return false;
  });
}

function weatherContent(data, placeName) {
  const weather = assessWeather(data.current);
  return '<strong>' + translate('weatherAt') + ' ' + escapeHtml(placeName) +
    '</strong><br>' +
    '<div class="weather-status ' + weather.statusClass + '">' +
    weather.status + '</div>' +
    '<div class="weather-scale" aria-label="Weather quality scale">' +
    '<span class="weather-marker" style="left: ' + (100 - weather.score) +
    '%"></span></div>' +
    '<div class="weather-scale-labels"><span>' + translate('good') + '</span>' +
    '<span>' + translate('caution') + '</span><span>' + translate('bad') +
    '</span></div>' +
    translate('temperature') + ': ' + data.current.temperature_2m + ' ' +
    data.current_units.temperature_2m + '<br>' +
    translate('windSpeed') + ': ' + data.current.wind_speed_10m + ' ' +
    data.current_units.wind_speed_10m + '<br>' +
    translate('precipitation') + ': ' + data.current.precipitation + ' ' +
    data.current_units.precipitation + '<br>' +
    translate('snowfall') + ': ' + data.current.snowfall + ' ' +
    data.current_units.snowfall;
}

function loadWeatherIntoPanel(latlng, placeName, panel) {
  panel.textContent = translate('weatherLoading');
  const params = new URLSearchParams({
    latitude: latlng.lat,
    longitude: latlng.lng,
    current: 'temperature_2m,wind_speed_10m,precipitation,snowfall,weather_code'
  });

  fetch('https://api.open-meteo.com/v1/forecast?' + params)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      panel.innerHTML = weatherContent(data, placeName);
    })
    .catch(function (error) {
      panel.textContent =
        (currentLanguage === 'fr'
          ? 'Impossible de récupérer la météo : '
          : 'Could not get weather: ') + error.message;
      console.error('Weather API error:', error);
    });
}

function showWeatherPopup(latlng, placeName) {
  if (!isOnMontrealIsland(latlng)) {
    clearTimeout(weatherRequestTimer);
    if (weatherPopup) {
      map.closePopup(weatherPopup);
      weatherPopup = null;
    }
    if (weatherLoadingPopup) {
      map.closePopup(weatherLoadingPopup);
      weatherLoadingPopup = null;
    }
    L.popup()
      .setLatLng(latlng)
      .setContent(translate('weatherOnlyMontreal'))
      .openOn(map);
    return;
  }

  const place = {
    name: placeName || 'selected map location',
    lat: latlng.lat,
    lon: latlng.lng
  };

  map.setView(latlng, 15);

  clearTimeout(weatherRequestTimer);
  if (weatherPopup) {
    map.closePopup(weatherPopup);
    weatherPopup = null;
  }
  if (weatherLoadingPopup) {
    map.closePopup(weatherLoadingPopup);
  }
  weatherLoadingPopup = L.popup({
    closeButton: true,
    closeOnClick: false,
    autoClose: false
  })
    .setLatLng(latlng)
    .setContent(translate('weatherLoading'))
    .addTo(map);
  const loadingPopup = weatherLoadingPopup;
  weatherRequestTimer = setTimeout(function () {
    const params = new URLSearchParams({
      latitude: place.lat,
      longitude: place.lon,
      current: 'temperature_2m,wind_speed_10m,precipitation,snowfall,weather_code'
    });
    const url = 'https://api.open-meteo.com/v1/forecast?' + params;

    fetch(url)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        return response.json();
      })
      .then(function (data) {
        if (weatherLoadingPopup !== loadingPopup) {
          return;
        }
        map.closePopup(loadingPopup);
        if (weatherLoadingPopup === loadingPopup) {
          weatherLoadingPopup = null;
        }
        weatherPopup = L.popup({
          closeButton: true,
          closeOnClick: false,
          autoClose: false
        })
          .setLatLng(latlng)
          .setContent(weatherContent(data, place.name))
          .addTo(map);
      })
      .catch(function (error) {
        if (weatherLoadingPopup !== loadingPopup) {
          return;
        }
        loadingPopup.setContent(
          (currentLanguage === 'fr' ? 'Impossible de récupérer la météo : ' : 'Could not get weather: ') +
          error.message
        );
        console.error('Weather API error:', error);
      });
  }, 3000);
}

function bindWeatherToLayer(layer, placeName) {
  layer.on('click', function (event) {
    if (event.originalEvent) {
      L.DomEvent.stopPropagation(event.originalEvent);
    }
    setTimeout(function () {
      showWeatherPopup(event.latlng, placeName);
    }, 0);
  });
}

// Show current weather for any location the reader clicks on the map.
map.on('click', function (event) {
  showWeatherPopup(event.latlng, 'selected map location');
  updateNearestRecommendations(event.latlng);
});

let boroughFeatures = [];
let selectedBorough = '';
let placeCategories;
let placesData;
let boroughLayer;
let boroughDensity = {};
let boroughDensityVisible = true;
let metroLayer;
let metroLayerVisible = true;
let placeSearchTerm = '';
let selectedPlaceFeature = null;

// Update the page with a small JavaScript demonstration.
const center = document.getElementById('center');
center.textContent = 'Hello from JavaScript';
center.style.background = '#DCBD23';

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
  return '#d3d3d3';
}

function demoColourFor(value) {
  if (value >= 50) return '#b30000';
  if (value >= 25) return '#e34a33';
  if (value > 0) return '#fdcc8a';
  return '#eeeeee';
}

console.log(demoColourFor(30), demoColourFor(0), demoColourFor(80));


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

function updateBoroughLayerVisibility() {
  if (!boroughLayer) {
    return;
  }

  if (boroughDensityVisible) {
    boroughLayer.addTo(map);
  } else {
    map.removeLayer(boroughLayer);
  }
}

function updateMetroLayerVisibility() {
  if (!metroLayer) {
    return;
  }

  if (metroLayerVisible) {
    metroLayer.addTo(map);
  } else {
    map.removeLayer(metroLayer);
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

function norm(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isPostalCode(value) {
  return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(value.trim());
}

function findPostalCode(value) {
  const search = new URLSearchParams({
    q: value.trim().toUpperCase() + ', Montreal, Canada',
    format: 'jsonv2',
    limit: '1'
  });
  const url = 'https://nominatim.openstreetmap.org/search?' + search;
  const count = document.getElementById('place-count');

  if (count) {
    count.textContent = 'Looking up postal code...';
  }

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      return response.json();
    })
    .then(function (results) {
      if (!results.length) {
        if (count) {
          count.textContent = 'Postal code not found';
        }
        return;
      }

      const location = results[0];
      map.setView([Number(location.lat), Number(location.lon)], 14);
      if (count) {
        count.textContent = 'Map centered on ' + value.trim().toUpperCase();
      }
    })
    .catch(function (error) {
      if (count) {
        count.textContent = 'Could not find postal code';
      }
      console.error('Postal code lookup error:', error);
    });
}

function featureMatchesSearch(feature) {
  if (!placeSearchTerm) {
    return true;
  }

  const properties = feature.properties;
  return [
    properties.titre_lieu,
    properties.arrondissements,
    properties.adresse_principale,
    properties.code_postal,
    properties.installations,
    properties.types
  ].some(function (value) {
    return searchScore(placeSearchTerm, value) !== Infinity;
  });
}

function editDistance(first, second) {
  const distances = Array.from({ length: second.length + 1 }, function (_, index) {
    return index;
  });

  for (let row = 1; row <= first.length; row += 1) {
    let previous = distances[0];
    distances[0] = row;
    for (let column = 1; column <= second.length; column += 1) {
      const current = distances[column];
      distances[column] = first[row - 1] === second[column - 1]
        ? previous
        : Math.min(previous, distances[column - 1], current) + 1;
      previous = current;
    }
  }

  return distances[second.length];
}

function searchScore(query, candidate) {
  const normalizedQuery = norm(query);
  const normalizedCandidate = norm(candidate);
  if (!normalizedQuery || !normalizedCandidate) {
    return Infinity;
  }
  if (normalizedCandidate.includes(normalizedQuery)) {
    return 0;
  }

  const queryTokens = normalizedQuery.split(/[\s,./-]+/).filter(Boolean);
  const candidateTokens = normalizedCandidate.split(/[\s,./-]+/).filter(Boolean);
  let score = 0;

  for (let index = 0; index < queryTokens.length; index += 1) {
    const queryToken = queryTokens[index];
    let bestTokenScore = Infinity;
    candidateTokens.forEach(function (candidateToken) {
      if (queryToken.length > 2 && candidateToken.indexOf(queryToken.slice(0, 3)) === 0) {
        bestTokenScore = Math.min(bestTokenScore, 0.25);
        return;
      }

      const distance = editDistance(queryToken, candidateToken);
      const allowedDistance = Math.max(1, Math.floor(queryToken.length * 0.35));
      if (distance <= allowedDistance) {
        bestTokenScore = Math.min(bestTokenScore, distance / queryToken.length);
      }
    });

    if (bestTokenScore === Infinity) {
      return Infinity;
    }
    score += bestTokenScore;
  }

  return score;
}

function updateSearchSuggestions(value) {
  const datalist = document.getElementById('place-suggestions');
  if (!datalist || !placesData) {
    return;
  }

  const query = norm(value);
  datalist.innerHTML = '';
  if (query.length < 2) {
    return;
  }

  const suggestions = [];
  const seen = {};
  placesData.features.forEach(function (feature) {
    const properties = feature.properties;
    const values = [
      properties.titre_lieu,
      properties.adresse_principale,
      properties.arrondissements,
      properties.code_postal
    ];

    values.forEach(function (value) {
      const suggestion = String(value || '').trim();
      if (!suggestion || seen[suggestion]) {
        return;
      }

      const score = searchScore(query, suggestion);
      if (score !== Infinity) {
        seen[suggestion] = true;
        suggestions.push({ value: suggestion, score: score });
      }
    });
  });

  suggestions.sort(function (first, second) {
    return first.score - second.score || first.value.localeCompare(second.value);
  });
  suggestions.slice(0, 8).forEach(function (suggestion) {
    const option = document.createElement('option');
    option.value = suggestion.value;
    datalist.appendChild(option);
  });
}

function focusPlaceFeature(feature) {
  if (!feature || !feature.geometry || feature.geometry.type !== 'Point') {
    return;
  }

  const coordinates = feature.geometry.coordinates;
  map.setView([coordinates[1], coordinates[0]], 15);
  const categoryLayer = placeCategories[feature.properties.types];
  if (!categoryLayer) {
    return;
  }

  categoryLayer.eachLayer(function (layer) {
    if (layer.feature === feature) {
      layer.openPopup();
    }
  });
}

function findPlaceBySearchValue(value) {
  const query = norm(value);
  if (!query || !placesData) {
    return null;
  }

  let bestMatch = null;
  let bestScore = Infinity;
  placesData.features.forEach(function (feature) {
    const properties = feature.properties;
    [properties.titre_lieu, properties.adresse_principale].forEach(function (candidate) {
      const score = searchScore(query, candidate);
      if (score < bestScore) {
        bestScore = score;
        bestMatch = feature;
      }
    });
  });

  return bestScore <= Math.max(1, query.split(/\s+/).length * 0.8)
    ? bestMatch
    : null;
}

function findMapLocation(value) {
  const search = new URLSearchParams({
    q: value.trim() + ', Montreal, Canada',
    format: 'jsonv2',
    limit: '1'
  });
  const url = 'https://nominatim.openstreetmap.org/search?' + search;
  const count = document.getElementById('place-count');

  if (count) {
    count.textContent = translate('searchAddressLoading');
  }

  fetch(url)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      return response.json();
    })
    .then(function (results) {
      if (!results.length) {
        if (count) {
          count.textContent = translate('searchAddressNotFound');
        }
        return;
      }

      const location = results[0];
      map.setView([Number(location.lat), Number(location.lon)], 16);
      if (count) {
        count.textContent = 'Map centered on ' + value.trim();
      }
    })
    .catch(function (error) {
      if (count) {
        count.textContent = translate('searchAddressError');
      }
      console.error('Address lookup error:', error);
    });
}

function updatePlaceCount() {
  const count = document.getElementById('place-count');
  if (!count || !placesData) {
    return;
  }

  const shown = placesData.features.filter(function (feature) {
    return featureMatchesSearch(feature) &&
      featureBelongsToBorough(feature, selectedBorough);
  }).length;

  count.textContent = shown === 0 && placeSearchTerm
    ? translate('noMatch')
    : shown + ' ' + (currentLanguage === 'fr' ? 'sur ' : 'of ') +
      placesData.features.length + ' ' + translate('placesShown');
}

function showPlaceDetails(feature) {
  const panel = document.getElementById('place-details');
  const content = document.getElementById('place-details-content');
  if (!panel || !content) {
    return;
  }

  selectedPlaceFeature = feature;
  const properties = feature.properties;
  const description = String(properties.description || translate('notAvailable'))
    .replace(/\r?\n/g, '<br>');
  content.innerHTML =
    '<h3>' + escapeHtml(properties.titre_lieu || translate('notAvailable')) + '</h3>' +
    '<p><strong>' + translate('description') + ':</strong><br>' +
    escapeHtml(description).replace(/&lt;br&gt;/g, '<br>') + '</p>' +
    '<p><strong>' + translate('address') + ':</strong> ' +
    escapeHtml(properties.adresse_principale || translate('notAvailable')) + '<br>' +
    '<strong>' + translate('type') + ':</strong> ' +
    escapeHtml(properties.types || translate('notAvailable')) + '<br>' +
    '<strong>' + translate('accessibility') + ':</strong> ' +
    escapeHtml(properties.accessibilite || translate('notAvailable')) + '<br>' +
    '<strong>' + translate('borough') + ':</strong> ' +
    escapeHtml(properties.arrondissements || translate('notAvailable')) + '</p>';
  panel.hidden = false;
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

function formatHoursTable(hours) {
  const summary = '<summary>' + translate('hours') + '</summary>';

  if (!hours) {
    return '<details class="hours-details">' + summary +
      '<table class="hours-table"><caption>' + translate('hours') + '</caption>' +
      '<tbody><tr><th scope="row">' + translate('hours') + '</th><td>' +
      translate('notAvailable') + '</td></tr></tbody>' +
      '</table></details>';
  }

  const schedule = hours.match(/^([^:]+):\s*\[(.*)\]$/);
  if (!schedule) {
    return '<details class="hours-details">' + summary +
      '<table class="hours-table"><caption>' + translate('hours') + '</caption>' +
      '<tbody><tr><th scope="row">' + translate('type') + '</th><td>' + hours + '</td></tr></tbody>' +
      '</table></details>';
  }

  const rows = schedule[2].split(/,\s*(?=[^,]+ \d{2}:\d{2}-)/).map(function (entry) {
    const separator = entry.indexOf(' ');
    return '<tr><th scope="row">' + entry.slice(0, separator) +
      '</th><td>' + entry.slice(separator + 1) + '</td></tr>';
  }).join('');

  return '<details class="hours-details">' + summary +
    '<table class="hours-table"><caption>' +
    (currentLanguage === 'fr' ? translate('regularSchedule') : schedule[1]) + '</caption>' +
    '<thead><tr><th scope="col">' + translate('hoursDay') +
    '</th><th scope="col">' + translate('hoursTime') + '</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></details>';
}

function renderPlaceLayers() {
  if (!placesData || !placeCategories) {
    return;
  }

  const searchMatches = placesData.features.some(function (feature) {
    return featureMatchesSearch(feature) &&
      featureBelongsToBorough(feature, selectedBorough);
  });

  Object.keys(placeCategories).forEach(function (category) {
    placeCategories[category].clearLayers();
    const categoryLayer = L.geoJSON(placesData, {
      filter: function (feature) {
        return feature.properties.types === category &&
          featureBelongsToBorough(feature, selectedBorough) &&
        (!placeSearchTerm || !searchMatches || featureMatchesSearch(feature));
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
        layer.on('click', function (event) {
          if (event.originalEvent) {
            L.DomEvent.stopPropagation(event.originalEvent);
          }
          showPlaceDetails(feature);
        });
        layer.bindPopup(
          '<strong>' + (p.titre_lieu || 'Unnamed place') + '</strong><br>' +
          translate('address') + ': ' + (p.adresse_principale || translate('notAvailable')) + '<br>' +
          translate('type') + ': ' + (p.types || translate('notAvailable')) + '<br>' +
          translate('installation') + ': ' + (p.installations || translate('notAvailable')) + '<br>' +
          translate('borough') + ': ' + (p.arrondissements || translate('notAvailable')) + '<br>' +
          formatHoursTable(p.horaire_par_jour) +
          translate('website') + ': ' + (p.url_fiche || translate('notAvailable')) + '<br>' +
          (p.url_fiche
            ? '<br><a href="' + p.url_fiche +
              '" target="_blank" rel="noopener">' + translate('moreInformation') + '</a>'
            : '') +
          '<br><span class="popup-action-buttons"><button type="button" class="nearest-options-button">' +
          translate('nearestButton') + '</button>' +
          '<button type="button" class="weather-options-button">' +
          translate('weatherButton') + '</button>' +
          '<button type="button" class="google-maps-button">' +
          translate('googleMapsButton') + '</button></span>' +
          '<div class="nearest-options-details" hidden></div>' +
          '<div class="weather-options-details" hidden></div>',
          { closeButton: true }
        );
        layer.on('popupopen', function (event) {
          showPlaceDetails(feature);
          const popupElement = event.popup.getElement();
          const button = popupElement.querySelector('.nearest-options-button');
          const details = popupElement.querySelector('.nearest-options-details');
          const weatherButton = popupElement.querySelector('.weather-options-button');
          const weatherDetails = popupElement.querySelector('.weather-options-details');
          const googleMapsButton = popupElement.querySelector('.google-maps-button');

          if (!button || !details || !weatherButton || !weatherDetails || !googleMapsButton) {
            return;
          }

          hideNearestRecommendations();
          L.DomEvent.disableClickPropagation(button);
          button.addEventListener('click', function () {
            const expanded = !details.hidden;
            details.hidden = expanded;
            button.setAttribute('aria-expanded', String(!expanded));
            if (!expanded) {
              updateNearestRecommendations(layer.getLatLng(), details);
            }
          });
          button.setAttribute('aria-expanded', 'false');
          L.DomEvent.disableClickPropagation(weatherButton);
          weatherButton.addEventListener('click', function () {
            const expanded = !weatherDetails.hidden;
            weatherDetails.hidden = expanded;
            weatherButton.setAttribute('aria-expanded', String(!expanded));
            if (!expanded) {
              loadWeatherIntoPanel(
                layer.getLatLng(),
                p.titre_lieu || 'selected community place',
                weatherDetails
              );
            }
          });
          weatherButton.setAttribute('aria-expanded', 'false');
          L.DomEvent.disableClickPropagation(googleMapsButton);
          googleMapsButton.addEventListener('click', function () {
            window.open(GOOGLE_MAPS_URL, '_blank', 'noopener,noreferrer');
          });
        });
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

function setupBoroughFilter() {
  const select = document.getElementById('borough-select');
  if (!select) {
    return;
  }

  boroughFeatures.slice().sort(function (a, b) {
    return norm(a.properties.NOM).localeCompare(norm(b.properties.NOM));
  }).forEach(function (feature) {
    const option = document.createElement('option');
    option.value = feature.properties.NOM;
    option.textContent = feature.properties.NOM;
    select.appendChild(option);
  });

  select.addEventListener('change', function (event) {
    selectedBorough = event.target.value;
    renderPlaceLayers();
    updatePlaceCount();
    zoomToBorough(selectedBorough);
  });
}

function setupInstallationFilters() {
  document.querySelectorAll('[data-category]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function (event) {
      const category = event.target.dataset.category;
      const layer = placeCategories[category];

      if (event.target.checked) {
        layer.addTo(map);
      } else {
        map.removeLayer(layer);
      }
    });
  });
}

// MONTREAL BOROUGH BOUNDARIES: basemap and zoom targets
fetch(dataRoot + 'mtl_bound.geojson')
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
        bindWeatherToLayer(layer, feature.properties.NOM || 'selected borough');
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
          updatePlaceCount();
          zoomToBorough(selectedBorough);
        });
      }
    });

    updateBoroughLayerVisibility();

    setupBoroughFilter();
  })
  .catch(function (err) {
    showDataLoadError('mtl_bound.geojson');

    console.error(err);
  });

// Display all features in the GeoJSON file.
const LIMIT = Infinity;

// Reusable colors for feature categories.
const colours = { 'Community Centers': '#800020',  'Parks and gardens': '#32d515aa', 'Sports and recreation': '#e27f39', 'Transit Bus Lines': '#c7a079', ' Transit Bus Stops': '#82816f2d', 'Metro Stations': '#f59e0b' };

const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  const categoryLabels = {
    'Community Centers': currentLanguage === 'fr'
      ? 'Centres communautaires'
      : 'Community Centers',
    'Parks and gardens': translate('parks'),
    'Sports and recreation': translate('sports'),
    'Transit Bus Lines': currentLanguage === 'fr' ? 'Lignes d’autobus' : 'Transit Bus Lines',
    ' Transit Bus Stops': currentLanguage === 'fr' ? 'Arrêts d’autobus' : 'Transit Bus Stops',
    'Metro Stations': currentLanguage === 'fr' ? 'Stations de métro' : 'Metro Stations'
  };
  const categoryItems = Object.keys(colours).filter(function (k) {
    return k !== 'Metro Stations';
  }).map(function (k) {
    return '<span style="background:' + colours[k] + '"></span>' + categoryLabels[k];
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
    '<label class="legend-toggle">' +
    '<input type="checkbox" id="borough-density-toggle"' +
    (boroughDensityVisible ? ' checked' : '') + '>' +
    '<strong>' + (currentLanguage === 'fr'
      ? 'Centres communautaires par arrondissement'
      : 'Community centres per borough') + '</strong>' +
    '</label><br>' +
    densityItems +
    '<br><label class="legend-toggle">' +
    '<input type="checkbox" id="metro-layer-toggle"' +
    (metroLayerVisible ? ' checked' : '') + '>' +
    '<span style="background:' + colours['Metro Stations'] + '"></span>' +
    (currentLanguage === 'fr' ? 'Stations de métro' : 'Metro Stations') +
    '</label>' +
    '<br><strong>' + (currentLanguage === 'fr' ? 'Catégories de la carte' : 'Map categories') + '</strong><br>' +
    categoryItems;
  L.DomEvent.disableClickPropagation(div);
  div.querySelector('#borough-density-toggle').addEventListener('change', function (event) {
    boroughDensityVisible = event.target.checked;
    updateBoroughLayerVisibility();
  });
  div.querySelector('#metro-layer-toggle').addEventListener('change', function (event) {
    metroLayerVisible = event.target.checked;
    updateMetroLayerVisibility();
  });
  return div;
};

legend.addTo(map);



// STOPS DATA: shows all MTL bus stop locations
// Request the stops GeoJSON and route-point CSV from the repository root.
Promise.all([
  fetch(dataRoot + 'stops_clean_output.geojson'),
  fetch(dataRoot + 'shapes.csv'),
  fetch(dataRoot + 'MetroStops/MetroStops.geojson')
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
      responses[1].text(),
      responses[2].json()
    ]);
  })
  .then(function (datasets) {
    const stopsData = datasets[0];
    metroFeatures = datasets[2].features;
    stopFeatures = stopsData.features;
    if (lastRecommendationPoint && placesData) {
      updateNearestRecommendations(lastRecommendationPoint);
    }
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
        bindWeatherToLayer(layer, p.stop_name || 'selected bus stop');
        layer.bindPopup(
          '<strong>' + p.stop_name + '</strong><br>' +
          'ID: ' + p.stop_id,
          { closeButton: true }
        );
      }
    });

    stopsLayer.addTo(map);

    metroLayer = L.geoJSON({
      type: 'FeatureCollection',
      features: metroFeatures
    }, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          color: '#b45309',
          radius: 6,
          fillColor: '#f59e0b',
          fillOpacity: 0.9,
          weight: 2
        });
      },
      onEachFeature: function (feature, layer) {
        const properties = feature.properties;
        bindWeatherToLayer(layer, properties.station || translate('metroStation'));
        layer.bindPopup(
          '<strong>' + escapeHtml(properties.station || translate('metroStation')) + '</strong><br>' +
          translate('metroStation') + '<br>' +
          'Line: ' + escapeHtml(properties.line || translate('notAvailable')) + '<br>' +
          'Wheelchair access: ' +
          escapeHtml(properties.wheelchair_access || translate('notAvailable')),
          { closeButton: true }
        );
      }
    });
    updateMetroLayerVisibility();

    // Report how many features were displayed.
    if (!dataLoadError) {
      document.getElementById('status').textContent =
        shown.features.length + ' of ' + stopsData.features.length +
        ' stops and ' + metroFeatures.length + ' metro stations shown';
    }

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
        bindWeatherToLayer(layer, 'selected transit route');
        layer.bindPopup(
          '<strong>Shape: ' +
          feature.properties.shape_id +
          '</strong>',
          { closeButton: true }
        );
      }
    });

    shapesLayer.addTo(map);

    if (!dataLoadError) {
      document.getElementById('status').textContent +=
        '\n' + lineFeatures.length + ' transit shapes displayed';
    }
  })
  .catch(function (err) {
    showDataLoadError('stops_clean_output.geojson or shapes.csv');

    console.error(err);
  });

//-------------------------------------------
// MONTREAL PLACES DATA: shows POI in Montreal

fetch(dataRoot + 'mtl_places_clean_output.geojson')
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
    if (lastRecommendationPoint && stopFeatures.length) {
      updateNearestRecommendations(lastRecommendationPoint);
    }
    calculateBoroughDensity(placesData.features);

    const parksLayer = L.layerGroup();
    const sportsLayer = L.layerGroup();
    const communityCentresLayer = L.layerGroup();

    placeCategories = {
      'Parks and gardens': parksLayer,
      'Sports and recreation': sportsLayer,
      'Arts, culture and community': communityCentresLayer
    };

    setupInstallationFilters();

    Object.keys(placeCategories).forEach(function (category) {
      const checkbox = document.querySelector(
        '[data-category="' + category + '"]'
      );
      if (checkbox && checkbox.checked) {
        placeCategories[category].addTo(map);
      }
    });

    map.on('zoomend', updatePlacePointSizes);
    renderPlaceLayers();
    updatePlaceCount();

    if (!dataLoadError) {
      document.getElementById('status').textContent =
        placesData.features.length + ' of ' + data.features.length + ' places shown';
    }

    const placeSearch = document.getElementById('place-search');
    placeSearch.addEventListener('input', function (event) {
      const value = event.target.value.trim();
      updateSearchSuggestions(value);
      if (isPostalCode(value)) {
        placeSearchTerm = '';
        renderPlaceLayers();
        document.getElementById('place-count').textContent =
          'Press Enter to zoom to this postal code';
        return;
      }

      placeSearchTerm = norm(value);
      renderPlaceLayers();
      updatePlaceCount();
    });
    placeSearch.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') {
        return;
      }

      event.preventDefault();
      const value = event.target.value.trim();
      const place = findPlaceBySearchValue(value);
      if (place) {
        placeSearchTerm = norm(value);
        renderPlaceLayers();
        updatePlaceCount();
        focusPlaceFeature(place);
      } else if (isPostalCode(value)) {
        findPostalCode(value);
      } else if (value) {
        findMapLocation(value);
      }
    });
  })
  .catch(function (err) {
    showDataLoadError('mtl_places_clean_output.geojson');

    console.error(err);
  });

/*
 * 211 QUEBEC API TEMPLATE
 *
 * This section is intentionally commented out until an approved API endpoint,
 * API key, and permission to republish the returned data are available.
 *
 * const apiUrl = 'https://data.211support.org/api/v1/search?key=YOUR_API_KEY';
 *
 * fetch(apiUrl, {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     Lang: 'en',
 *     Search: 'community centres and recreation',
 *     SearchType: 'coverage',
 *     PageIndex: 0,
 *     PageSize: 50
 *   })
 * })
 *   .then(function (response) {
 *     if (!response.ok) {
 *       throw new Error('Could not load 211 data');
 *     }
 *
 *     return response.json();
 *   })
 *   .then(function (data) {
 *     console.log(data);
 *     // Convert approved 211 results into map markers here.
 *   })
 *   .catch(function (error) {
 *     console.error('211 API error:', error);
 *   });
 */
