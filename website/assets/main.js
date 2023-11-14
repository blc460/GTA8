var trip = {};

function saveInput() {
	var name = document.getElementById("name").value;
	var transportMode = document.getElementById("transportMode").value;

	// You can perform any desired actions with the collected data here
	console.log("Name: " + name + ", Transport Mode: " + transportMode);
	trip["name"] = name;
	trip["transportMode"] = transportMode;

	document.getElementById("name").value = "";
	document.getElementById("transportMode").value= "";

	// Close the popup after saving the input
	document.getElementById("popup").style.display = "none";
}


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


	var trackpoints = [];



	// Aktivieren Sie die Geolokalisierung und überwachen Sie die Position laufend.

	function geoSuccess(position) {
		// Rufen Sie die aktualisierte Position ab und aktualisieren Sie den Location Circle.
		var latlng = L.latLng(position.coords.latitude, position.coords.longitude);
		var accuracy = position.coords.accuracy;

		if (locationCircle) {
			locationCircle.setLatLng(latlng);
			locationCircle.setRadius(accuracy);
		} else {
			locationCircle = L.circle(latlng, accuracy).addTo(map);
		}
		//save position when in tracking mode
		if (tracking) {
			trackpoints.push(latlng)
			console.log("position logged");
		}
	}

	function geoError(error) {
		// Behandeln Sie Fehler bei der Geolokalisierung.
		console.error("Fehler bei der Geolokalisierung:", error);
	}

	geoOptions = {
		//options
		enableHighAccuracy: true,
		maximumAge: 15000,  // The maximum age of a cached location (15 seconds).
		//timeout: 30000   // A maximum of 12 seconds before timeout.
	}

	var watchID = navigator.geolocation.watchPosition(geoSuccess, geoError, geoOptions);

	// Überwachung der Position stoppen:
	// navigator.geolocation.clearWatch(watchID);


	document.getElementById("closePopupBtn").addEventListener("click", function () {
		document.getElementById("popup").style.display = "none";
	});

	
	var tracking = false;
	function startStopButton() {
		var buttonElement = document.getElementById("button");
		if (buttonElement.innerHTML === "Start") {
			buttonElement.innerHTML = "Stop";
			buttonElement.style.backgroundColor = "#000";

			//Start tracking
			tracking = true;
			console.log("now tracking");
			trip["trip_id"] = 0; //herausfinden welche ids in datenbank schon besetzt?

		} else {
			buttonElement.innerHTML = "Start";
			buttonElement.style.backgroundColor = '#444444';

			// pop-up fenster: name und transport_mode abfragen
			document.getElementById("popup").style.display = "flex";


			trip["date_of_collection"] = Date.now();
			console.log(trackpoints);

			insertData_trip(trackpoints, trip["ip_adress"], trip["trip_id"], trip["date_of_collection"], trip["name"], trip["transportMode"])

			//stop tracking and reset
			tracking = false;
			console.log("stopped tracking");
			trackpoints = [];
			trip = {};
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
				console.log("zentriert");
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
		trip["ip_adress"] = e.ip;
		console.log(e.ip);
	});

	function insertData_trip(trackpoints, ip_adress, trip_id, date_of_collection, trip_name, trip_transport_mode) {

		let lineStringCoords = trackpoints.map(point => point.join(' ')).join(',');
	
		let postData =
			'<wfs:Transaction\n'
			+ '  service="WFS"\n'
			+ '  version="1.0.0"\n'
			+ '  xmlns="http://www.opengis.net/wfs"\n'
			+ '  xmlns:wfs="http://www.opengis.net/wfs"\n'
			+ '  xmlns:gml="http://www.opengis.net/gml"\n'
			+ '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
			+ '  xmlns:GTA23_project="http://www.gis.ethz.ch/GTA23_project" \n'
			+ '  xsi:schemaLocation="http://www.gis.ethz.ch/GTA23_lab07 \n http://ikgeoserv.ethz.ch:8080/geoserver/GTA23_project/wfs?service=WFS&amp;version=1.0.0&amp;request=DescribeFeatureType&amp;typeName=GTA23_project%3Atrip \n'
			+ '                      http://www.opengis.net/wfs\n'
			+ '                      http://ikgeoserv.ethz.ch:8080/geoserver/schemas/wfs/1.0.0/WFS-basic.xsd">\n'
			+ '  <wfs:Insert>\n'
			+ '    <GTA23_project:trip>\n'
			+ '      <trip_id>' + trip_id + '</trip_id>\n'
			+ '      <trip_date_of_collection>' + date_of_collection + '</trip_date_of_collection>\n'
			+ '      <trip_name>' + trip_name + '</trip_name>\n'
			+ '      <trip_transport_mode>' + trip_transport_mode + '</trip_transport_mode>\n'
			+ '      <trip_ip_adress>' + ip_adress + '</trip_ip_adress>\n'
			+ '      <geometry>\n'
			+ '        <gml:LineString srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">\n'
			+ '          <gml:coordinates xmlns:gml="http://www.opengis.net/gml" decimal="." cs="," ts=" ">' + lineStringCoords + '</gml:coordinates>\n'
			+ '        </gml:LineString>\n'
			+ '      </geometry>\n'
			+ '    </GTA23_project:trip>\n'
			+ '  </wfs:Insert>\n'
			+ '</wfs:Transaction>';
		
		$.ajax({
			type: "POST",
			url: gs.wfs,
			dataType: "xml",
			contentType: "text/xml",
			data: postData,
			success: function(xml) {	
				//Success feedback
				console.log("Success from AJAX");
				
				// Do something to notisfy user
				alert("Data uploaded");
			},
			error: function (xhr, ajaxOptions, thrownError) {
				//Error handling
				console.log("Error from AJAX");
				console.log(xhr.status);
				console.log(thrownError);
			  }
		});
	}


});
