$(document).ready(function () {
	console.log("ready!");


	// create and display map --------------------------------------------------------------------


	var map = L.map('map', { zoomControl: false }).setView([46.79851, 8.23173], 6);

	L.tileLayer('https://api.maptiler.com/maps/ch-swisstopo-lbm/{z}/{x}/{y}.png?key=5GIyaQiOX7pA9JBdK5R8', {
		minZoom: 2,
		maxZoom: 20,
		attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		ext: 'png'
	}).addTo(map);

	map.locate({ setView: true, maxZoom: 16 });

	var locationCircle;

	function onLocationFound(e) {
		var radius = e.accuracy;

		if (locationCircle) {
			// update position and radius if location circle exists
			locationCircle.setLatLng(e.latlng);
			locationCircle.setRadius(radius);
			console.log("Position aktualisiert!");
		} else {
			// create new location circle if not
			locationCircle = L.circle(e.latlng, radius).addTo(map);
		}
	}
	map.on('locationfound', onLocationFound);
	function onLocationError(e) {
		alert(e.message);
	}
	map.on('locationerror', onLocationError);

	// Add WMS Layer ---------------------------------------------------------------
	/*var restaurant = L.tileLayer.wms('https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wms', {
		layers: 'restaurant',
		format: 'image/png',
		transparent: true,
	}).addTo(map);

	var trip = L.tileLayer.wms('https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wms', {
		layers: 'trip',
		format: 'image/png',
		transparent: true,
	}).addTo(map);*/

	// trip visualisation: ---------------------------------------------------------------
	// Erstellen Sie ein URLSearchParams-Objekt, um auf die URL-Parameter zuzugreifen
	var urlParams = new URLSearchParams(window.location.search);

	// Lesen Sie den Wert des "link"-Parameters
	var linkParam = urlParams.get("link");

	// Überprüfen Sie, ob der Parameter vorhanden ist
	if (linkParam) {
		console.log("Link parameter found:", linkParam);

		// Hier können Sie den Link-Parameter verwenden, wie es benötigt wird
		// Zum Beispiel können Sie ihn einer Variable zuweisen oder eine Funktion aufrufen
		processLink(linkParam);
	} else {
		console.log("Link parameter not found.");
	}


	function processLink(link) {
		// Anfrage mit der ursprünglichen URL durchführen
		$.ajax({
			// URL to the Vercel production deployment (vercel --prod will give you this link)
			url: link,
			type: 'GET',
			dataType: 'JSON',
			success: function (data) {
				// Speichern Sie die Daten in der globalen Variable
				responseData = data;
				console.log(responseData);
	
				// Überprüfe den Wert von "cat" im Link und rufe die entsprechende Funktion auf
				var urlParams = new URLSearchParams(link);
				console.log(urlParams);
				var catParam = urlParams.get("cat");
				console.log(catParam)
				// Überprüfe den Wert von "trip_id" im Link und rufe die entsprechende Funktion auf
				var tripIdParam = urlParams.get("https://side-eye-vercel.vercel.app/get_id_list?trip_id");
				console.log(tripIdParam)

				if (catParam === "0") {
					displayRestaurants(responseData);
				} else if (catParam === "1") {
					displayChurch(responseData);
				} else {
					console.log("Invalid cat parameter value:", catParam);
				}
	
				if (tripIdParam) {
					// Rufe die displayTrip-Funktion auf, wenn trip_id im Link vorhanden ist
					displayTrip([tripIdParam]);
				}
			},
			error: function (data) {
				console.log(data);
			},
		});
	}

	//icons ------------------------------------------
	var pois = L.icon({
		iconUrl: 'assets/SVG/pois.svg',
		//iconSize: [38, 95],
		iconAnchor: [22, 94],
		popupAnchor: [-3, -76]
	});

	var marked = L.icon({
		iconUrl: 'assets/SVG/marked.svg',
		//iconSize: [38, 95],
		iconAnchor: [22, 94],
		popupAnchor: [-3, -76]
	});
	
	
	

	function displayRestaurants(data) {
		// Annahme: responseData ist ein Array von Restaurant-IDs
		data.forEach(function (restaurantId) {
			// Hier rufst du die Informationen für jedes Restaurant anhand der ID ab
			$.ajax({
				url: 'https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wms',
				type: 'GET',
				data: {
					service: 'WFS',
					request: 'GetFeature',
					typeName: 'restaurant',
					outputFormat: 'application/json',
					featureID: restaurantId,
				},
				dataType: 'JSON',
				success: function (restaurantData) {
					// Hier kannst du die Koordinaten oder andere Informationen des Restaurants extrahieren
					var coordinates = restaurantData.features[0].geometry.coordinates;

					// Hier fügst du einen Marker für das Restaurant auf der Karte hinzu
					L.marker([coordinates[1], coordinates[0]], {icon: pois}).addTo(map);
				},
				error: function (error) {
					console.log(error);
				},
			});
		});
	}

	function displayChurch(data) {
		// Annahme: responseData ist ein Array von Church-IDs
		data.forEach(function (churchId) {
			// Hier rufst du die Informationen für jede Church anhand der ID ab
			$.ajax({
				url: 'https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wms',
				type: 'GET',
				data: {
					service: 'WFS',
					request: 'GetFeature',
					typeName: 'church',
					outputFormat: 'application/json',
					featureID: churchId,
				},
				dataType: 'JSON',
				success: function (churchData) {
					// Hier kannst du die Koordinaten oder andere Informationen des Restaurants extrahieren
					var coordinates = churchData.features[0].geometry.coordinates;

					// Hier fügst du einen Marker für das Restaurant auf der Karte hinzu
					L.marker([coordinates[1], coordinates[0]], {icon: pois}).addTo(map);
				},
				error: function (error) {
					console.log(error);
				},
			});
		});
	}

	function displayTrip(data) {
		// Annahme: data ist ein Array von Trip-IDs
		data.forEach(function (tripId) {
			// Hier rufst du die Informationen für jeden Trip anhand der ID ab
			$.ajax({
				url: 'https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wms',
				type: 'GET',
				data: {
					service: 'WFS',
					request: 'GetFeature',
					typeName: 'trip',
					outputFormat: 'application/json',
					featureID: tripId,
				},
				dataType: 'JSON',
				success: function (tripData) {
					// Hier kannst du die Koordinaten oder andere Informationen des Trips extrahieren
					var coordinates = tripData.features[0].geometry.coordinates;
	
					// Hier fügst du eine Polylinie für den Trip auf der Karte hinzu
					var polyline = L.polyline(coordinates.map(function(coord) {
						return [coord[1], coord[0]];
					})).addTo(map);
	
					// Optional: Zoom zur Polylinie
					map.fitBounds(polyline.getBounds());
				},
				error: function (error) {
					console.log(error);
				},
			});
		});
	}
	




});