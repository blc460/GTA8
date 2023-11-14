$(document).ready(function () {
	console.log("ready!");

	//import { button1, button2 } from "./buttons.js";

	// Map
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
			// Wenn der Location Circle bereits existiert, aktualisieren Sie seine Position und seinen Radius.
			locationCircle.setLatLng(e.latlng);
			locationCircle.setRadius(radius);
			console.log("Position aktualisiert!");
		} else {
			// Andernfalls erstellen Sie den Location Circle.
			locationCircle = L.circle(e.latlng, radius).addTo(map);
		}
	}

	map.on('locationfound', onLocationFound);

	function onLocationError(e) {
		alert(e.message);
	}

	map.on('locationerror', onLocationError);

	var timestamps = {};

	// Aktivieren Sie die Geolokalisierung und überwachen Sie die Position laufend.
	var watchID = navigator.geolocation.watchPosition(function (position) {
		// Rufen Sie die aktualisierte Position ab und aktualisieren Sie den Location Circle.
		var latlng = L.latLng(position.coords.latitude, position.coords.longitude);
		var accuracy = position.coords.accuracy;

		if (locationCircle) {
			locationCircle.setLatLng(latlng);
			locationCircle.setRadius(accuracy);
		} else {
			locationCircle = L.circle(latlng, accuracy).addTo(map);
		}

		if (tracking) {
			//record position
		}
	}, function (error) {
		// Behandeln Sie Fehler bei der Geolokalisierung.
		console.error("Fehler bei der Geolokalisierung:", error);
	});

	// Um die Überwachung der Position zu stoppen, können Sie watchID verwenden:
	// navigator.geolocation.clearWatch(watchID);

	var tracking = false;
	function startStopButton() {
		var buttonElement = document.getElementById("button");
		var trip_id;
		var date_of_collection;
		var ip_adress;
		if (buttonElement.innerHTML === "Start") {
			buttonElement.innerHTML = "Stop";
			buttonElement.style.backgroundColor = "#000";

			//Start tracking
			tracking = true;
			console.log("now tracking");
			trip_id = 0; //herausfinden welche ids in datenbank schon besetzt?

		} else {
			buttonElement.innerHTML = "Start";
			buttonElement.style.backgroundColor = '#444444';
			
			//Stop tracking
			tracking = false;
			console.log("stopped tracking");
			// pop-up fenster: transport_mode etc abfragen
			date_of_collection = Date.now();
			ip_adress = 0; //Funktion aufrufen
		}
	}

	// Fügen Sie das onclick-Ereignis dem Button hinzu
	var button = document.getElementById("button");
	button.onclick = startStopButton;



	function locatingButton() {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(function (position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				var zoomLevel = 16; // Passen Sie den Zoom-Level nach Bedarf an.
				map.setView([lat, lng], zoomLevel);
			});
		} else {
			alert("Geolocation is not supported by your browser.");
		}
	}

	// Fügen Sie das onclick-Ereignis dem Button hinzu
	var locateButton = document.getElementById("locateButton");
	locateButton.onclick = locatingButton

	//IP-Adresse
	$.getJSON("https://api.ipify.org/?format=json", function (e) {
		console.log(e.ip);
	});


});
