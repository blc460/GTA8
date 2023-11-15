var trip = {};
var tracking = false;
var trackpoints = [];
var markedpoints = [];

// save ip address
$.getJSON("https://api.ipify.org/?format=json", function (e) {
	trip["ip_address"] = e.ip;
	console.log(e.ip);
});

// save input from pop-up window
function saveInput() {
	// save user input
	trip["name"] = document.getElementById("name").value;
	trip["transportMode"] = document.getElementById("transportMode").value;

	// reset form
	document.getElementById("name").value = "";
	document.getElementById("transportMode").value = "";

	// close the popup
	document.getElementById("popup").style.display = "none";
}


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


	// location tracking: ---------------------------------------------------------------


	function geoSuccess(position) {
		// call the current position
		var latlng = L.latLng(position.coords.latitude, position.coords.longitude);
		var accuracy = position.coords.accuracy;
		// update location circle
		if (locationCircle) {
			locationCircle.setLatLng(latlng);
			locationCircle.setRadius(accuracy);
		} else {
			locationCircle = L.circle(latlng, accuracy).addTo(map);
		}
		// save position when in tracking mode
		if (tracking) {
			trackpoints.push(latlng)
			console.log("position logged");
		}
	}
	function geoError(error) {
		// handle errors
		console.error("Fehler bei der Geolokalisierung:", error);
	}
	geoOptions = {
		// options
		enableHighAccuracy: true,
		maximumAge: 15000,  // The maximum age of a cached location (15 seconds).
		// timeout: 30000   // A maximum of 30 seconds before timeout.
	}

	// activate geolocation tracking
	var watchID = navigator.geolocation.watchPosition(geoSuccess, geoError, geoOptions);

	// end location tracking
	// // navigator.geolocation.clearWatch(watchID);



	// buttons -----------------------------------------------------------------------------


	// startstop button: (de)activate tracking---------------------------------------------
	function startStopButton() {
		var buttonElement = document.getElementById("button");
		// start tracking
		if (buttonElement.innerHTML === "Start") {
			// change button
			buttonElement.innerHTML = "Stop";
			buttonElement.style.backgroundColor = "#000";
			// enable tracking
			tracking = true;
			console.log("now tracking");
		}
		// stop tracking
		else {
			// change button
			buttonElement.innerHTML = "Start";
			buttonElement.style.backgroundColor = '#444444';
			// pop-up window
			document.getElementById("popup").style.display = "flex";
			// get timestamp
			trip["date_of_collection"] = Date.now();
			// upload trip data and marked points
			console.log(trackpoints);
			console.log(trackpoints[0]['lat']);
			insertData_trip(trackpoints, trip);
			//insertData_points(markedpoints, trip); ----> Noch nicht fertig implementiert (s.unten)
			// stop tracking
			tracking = false;
			console.log("stopped tracking");
			// reset
			trackpoints = [];
			markedpoints = [];
			trip = {};
		}
	}
	// add onclick-event to the button
	var button = document.getElementById("button");
	button.onclick = startStopButton;

	// close pop-up
	document.getElementById("closePopupBtn").addEventListener("click", function () {
		document.getElementById("popup").style.display = "none";
	});

	// locating button: center map at current location---------------------------------------
	function locatingButton() {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(function (position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				var zoomLevel = 16;
				map.setView([lat, lng], zoomLevel);
				console.log("center");
			});
		} else {
			alert("Geolocation is not supported by your browser.");
		}
	}
	// add onclick-event to the button
	var locateButton = document.getElementById("locateButton");
	locateButton.onclick = locatingButton;

	// draw button: mark interesting point-------------------------------------------------------
	function markingButton() {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(function (position) {
				var lat = position.coords.latitude;
				var lng = position.coords.longitude;
				var time = Date.now();
				markedpoints.push((time, lat, lng));
				console.log("point marked successfully");
				console.log(markedpoints);
			});
		} else {
			alert("Geolocation is not supported by your browser.");
		}
	}
	// add onclick-event to the button
	var markPointButton = document.getElementById("drawButton");
	markPointButton.onclick = markingButton;


	// upload to database: -----------------------------------------------------------------------


	function insertData_trip(trackpoints, trip) {
		ip_address = trip["ip_address"]
		date_of_collection = trip["date_of_collection"]
		trip_name = trip["name"]
		trip_transport_mode = trip["transportMode"]
		var lineStringCoords = new String();

		for (const tubel in lineStringCoords) {
			lineStringCoords = lineStringCoords.concat(tubel['lat']);
			lineStringCoords = lineStringCoords.concat(' ');
			lineStringCoords = lineStringCoords.concat(tubel['lng']);
			lineStringCoords = lineStringCoords.concat(',');
		  }
		
		lineStringCoords = stralt.substr(0, stralt.length - 1);
		

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
			+ '      <trip_date_of_collection>' + date_of_collection + '</trip_date_of_collection>\n'
			+ '      <trip_name>' + trip_name + '</trip_name>\n'
			+ '      <trip_transport_mode>' + trip_transport_mode + '</trip_transport_mode>\n'
			+ '      <trip_ip_adress>' + ip_address + '</trip_ip_adress>\n'
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
			success: function (xml) {
				// success feedback
				console.log("Success from AJAX");

				// do something to notify user
				alert("Data uploaded");
			},
			error: function (xhr, ajaxOptions, thrownError) {
				// error handling
				console.log("Error from AJAX");
				console.log(xhr.status);
				console.log(thrownError);
			}
		});
	}

	/*function insertPoint(lat, lng, timestamp, trip_id) {

		let postData =
			'<wfs:Transaction\n'
			+ '  service="WFS"\n'
			+ '  version="1.0.0"\n'
			+ '  xmlns="http://www.opengis.net/wfs"\n'
			+ '  xmlns:wfs="http://www.opengis.net/wfs"\n'
			+ '  xmlns:gml="http://www.opengis.net/gml"\n'
			+ '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
			+ '  xmlns:GTA23_lab07="http://www.gis.ethz.ch/GTA23_lab07" \n'
			+ '  xsi:schemaLocation="http://www.gis.ethz.ch/GTA23_lab07 \n http://ikgeoserv.ethz.ch:8080/geoserver/GTA23_lab07/wfs?service=WFS&amp;version=1.0.0&amp;request=DescribeFeatureType&amp;typeName=GTA23_lab07%3Agta_u30_lab07 \n'
			+ '                      http://www.opengis.net/wfs\n'
			+ '                      http://ikgeoserv.ethz.ch:8080/geoserver/schemas/wfs/1.0.0/WFS-basic.xsd">\n'
			+ '  <wfs:Insert>\n'
			+ '    <GTA23_lab07:gta_u30_lab07>\n'
			+ '      <lon>' + lng + '</lon>\n'
			+ '      <lat>' + lat + '</lat>\n'
			+ '      <name>' + name + '</name>\n'
			+ '      <geometry>\n'
			+ '        <gml:Point srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">\n'
			+ '          <gml:coordinates xmlns:gml="http://www.opengis.net/gml" decimal="." cs="," ts=" ">' + lng + ',' + lat + '</gml:coordinates>\n'
			+ '        </gml:Point>\n'
			+ '      </geometry>\n'
			+ '    </GTA23_lab07:gta_u30_lab07>\n'
			+ '  </wfs:Insert>\n'
			+ '</wfs:Transaction>';

		$.ajax({
			type: "POST",
			url: gs.wfs,
			dataType: "xml",
			contentType: "text/xml",
			data: postData,
			success: function (xml) {
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

	function insertData_points(markedpoints, trip) {
		var trip_id = trip["trip_id"];
		for (let pt in markedpoints) {
			var pt_lat = pt[0];
			var pt_lon
			insertPoint(lat, lng, trip_id)
		}
	}*/


});
