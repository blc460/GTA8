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

	// brauchen wir das???
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
				console.log(data);
			},
			error: function (data) { console.log(data); },
		});
	}




});