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
    }).addTo(map);*/

	var trip = L.tileLayer.wms('https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wms', {
        layers: 'trip',
        format: 'image/png',
        transparent: true,
    }).addTo(map);

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
				// Jetzt kannst du die Restaurants anzeigen
                displayRestaurants(responseData);
			},
			error: function (data) {
				console.log(data);
			},
		});
	}

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
					L.marker([coordinates[1], coordinates[0]]).addTo(map);
				},
				error: function (error) {
					console.log(error);
				},
			});
		});
	}




});