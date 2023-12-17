var trip = {};
var tracking = false;
var trackpoints = [];
var markedpoints = [];

// save ip address
$.getJSON("https://api.ipify.org/?format=json", function (e) {
	trip["ip_address"] = e.ip;
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

function getTimestamp() {
	var ts = new Date();
	ts = ts.toISOString();
	return ts;
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
		document.getElementById("popup_alert_geolocaliation").style.display = "flex";
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
			trackpoints.push(latlng);
			console.log("position logged");
		}
	}
	function geoError(error) {
		// handle errors
		console.error("Fehler bei der Geolokalisierung:", error);
	}
	geoOptions = {
		// options
		enableHighAccuracy: false,
		maximumAge: 15000,  // The maximum age of a cached location (15 seconds).
	}

	// activate geolocation tracking
	var watchID = navigator.geolocation.watchPosition(geoSuccess, geoError, geoOptions);

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
			// tracking dot
			var dotElement = document.createElement("div");
			dotElement.id = "trackingDot";
			dotElement.style.width = "10px";
			dotElement.style.height = "10px";
			dotElement.style.backgroundColor = "red";
			dotElement.style.borderRadius = "50%";
			dotElement.style.position = "fixed";
			dotElement.style.top = "10px";
			dotElement.style.right = "10px";
			dotElement.style.animation = "blinking 2s infinite"; // define a blinking animation
			document.body.appendChild(dotElement);
		}

		// stop tracking
		else {
			// change button
			buttonElement.innerHTML = "Start";
			buttonElement.style.backgroundColor = '#444444';
			// remove tracking dot
			var dotElement = document.getElementById("trackingDot");
			if (dotElement) {
				dotElement.parentNode.removeChild(dotElement);
			}
			// pop-up window
			document.getElementById("popup").style.display = "flex";
			// close pop-up
			document.getElementById("evaluateTrip").addEventListener("click", function () {
				if (trackpoints.length < 2) {
					document.getElementById("popup_alert").style.display = "flex";
				}
				// get timestamp
				trip["date_of_collection"] = getTimestamp();

				// upload trip data and as soons as this is finshed, also the marked points
				insertData_trip(trackpoints, trip)
				.then((insertedId) => {
				  	// perform further actions based on the insertedId
				  	if (insertedId !== null) {
						trip["trip_id"] = insertedId;
				  	}
					if (markedpoints.length > 0) {
						insertData_points(markedpoints, trip);
					}
					// stop tracking
					tracking = false;
					console.log("stopped tracking");
					// reset
					trackpoints = [];
					markedpoints = [];
					trip = {};
					document.getElementById("popup").style.display = "none";
					})
				.catch((error) => {
					console.error("Error:", error);
				});
			});
		}
	}

	// CSS animation for blinking dot
	var style = document.createElement('style');
	style.innerHTML = `
    @keyframes blinking {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
	document.head.appendChild(style);
	// add onclick-event to the button
	var button = document.getElementById("button");
	button.onclick = startStopButton;

	// locating button: center map at current location
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
			document.getElementById("popup_alert_geolocaliation").style.display = "flex";
		}
	}
	// add onclick-event to the button
	var locateButton = document.getElementById("locateButton");
	locateButton.onclick = locatingButton;

	// draw button: mark interesting point
	function markingButton() {
		if ("geolocation" in navigator) {
			if (tracking) {
				navigator.geolocation.getCurrentPosition(function (position) {
					markedpoints.push([position.coords.latitude, position.coords.longitude, getTimestamp()]);
					console.log("point marked successfully");
				});
			}
			else {
				// notification if there is no possibility to mark points
				document.getElementById("popup_alert_marked_point").style.display = "flex";

			}
		} else {
			document.getElementById("popup_alert_geolocaliation").style.display = "flex";
			
		}
	}
	// add onclick-event to the button
	var markPointButton = document.getElementById("drawButton");
	markPointButton.onclick = markingButton;


	// upload to database: -----------------------------------------------------------------------

	var gs = {
		wfs: 'https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wfs',
		ows: 'https://ikgeoserv.ethz.ch/geoserver/GTA23_project/ows'
	};

	// function to extract the inserted feature ID from the Insert response
	function extractIdFromInsertResponse(responseXml) {
		var returned_id = null;

		// use jQuery to parse the XML response
		var $xml = $(responseXml);

		// check if the response contains the necessary elements
		var $featureId = $xml.find('ogc\\:FeatureId');
		if ($featureId.length > 0) {
			var fullId = $featureId.attr('fid');
			
			// extract the numeric part after the 'trip.'
			var numericPart = fullId.replace('trip.', '');
			
			// Convert the numeric part to a number (if needed)
			returned_id = parseInt(numericPart, 10);
		}

		return returned_id;
	}


	// upload the trip to the database
	function insertData_trip(trackpoints, trip) {
		return new Promise((resolve, reject) => {
		  var ip_address = trip["ip_address"];
		  var date_of_collection = trip["date_of_collection"];
		  var trip_name = trip["name"];
		  var trip_transport_mode = trip["transportMode"];
		  var lineStringCoords = '';
	  
		  // construct the LineString coordinates
		  for (const tuple of trackpoints) {
			lineStringCoords += `${tuple['lng']},${tuple['lat']} `;
		  }
		  lineStringCoords = lineStringCoords.trim();
	  
		  // construct the XML request
		  let postData =
			'<wfs:Transaction\n' +
			'service="WFS"\n' +
			'version="1.0.0"\n' +
			'xmlns="http://www.opengis.net/wfs"\n' +
			'xmlns:wfs="http://www.opengis.net/wfs"\n' +
			'xmlns:gml="http://www.opengis.net/gml"\n' +
			'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
			'xmlns:GTA23_project="http://www.gis.ethz.ch/GTA23_project" \n' +
			'xsi:schemaLocation="http://www.gis.ethz.ch/GTA23_project \n https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wfs?service=WFS&amp;version=1.0.0&amp;request=DescribeFeatureType&amp;typeName=GTA23_project%3Atrip\n' +
			'http://www.opengis.net/wfs\n' +
			'https://ikgeoserv.ethz.ch/geoserver/schemas/wfs/1.0.0/WFS-basic.xsd">\n' +
			'<wfs:Insert>\n' +
			'<GTA23_project:trip>\n' +
			`<trip_date_of_collection>${date_of_collection}</trip_date_of_collection>\n` +
			`<trip_name>${trip_name}</trip_name>\n` +
			`<trip_transport_mode>${trip_transport_mode}</trip_transport_mode>\n` +
			`<trip_ip_address>${ip_address}</trip_ip_address>\n` +
			'<geometry>\n' +
			'<gml:LineString srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">\n' +
			`<gml:coordinates xmlns:gml="http://www.opengis.net/gml" decimal="." cs="," ts=" ">${lineStringCoords}</gml:coordinates>\n` +
			'</gml:LineString>\n' +
			'</geometry>\n' +
			'</GTA23_project:trip>\n' +
			'</wfs:Insert>\n' +
			'</wfs:Transaction>';

		  // post the data to the geoserver
		  $.ajax({
			type: "POST",
			url: gs.wfs,
			dataType: "xml",
			contentType: "text/xml",
			data: postData,
			success: function (xml) {
			 
			  var insertedId = extractIdFromInsertResponse(xml);
	  
			  // notify user
			  console.log("Data uploaded. Inserted ID: " + insertedId);

			  // clean uploaded LineString
			  link = `https://side-eye-vercel.vercel.app/update_linestring?trip_id=${insertedId}`;
			  
			  // call the clean-linestring function (deletes jumps)
			  $.ajax({
				type: "GET",
				url: link,
				success: function(data) {
					console.log("Function on Vercel called successfully:", data);
					// resolve the promise with the insertedId
					resolve(insertedId);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					console.error("Error calling function on Vercel:", errorThrown);
					// reject the promise with an error
					reject(errorThrown);
				}
			  });
			},
			error: function (xhr, ajaxOptions, thrownError) {
			  console.log("Error from AJAX");
			  console.log(xhr.status);
			  console.log(thrownError);
	  
			  // reject the promise with an error
			  reject(thrownError);
			},
		  });
		});
	}
	
	// upload the marked points to the database
	function insertData_points(markedpoints, trip) {
		var trip_id = trip["trip_id"];
		// iterate through all marked points
		for (var pt of markedpoints) {
			console.log(pt);
			var pt_lat = pt[0];
			var pt_lng = pt[1];
			var pt_time = pt[2];
			console.log(pt_time);
			insertPoint_markedPoint(pt_lat, pt_lng, pt_time, trip_id);
		}
	}

	// upload a single marked point to the database
	function insertPoint_markedPoint(pt_lat, pt_lng, pt_time, trip_id) {

		// construct the request
		let postData =
			'<wfs:Transaction\n'
			+ '  service="WFS"\n'
			+ '  version="1.0.0"\n'
			+ '  xmlns="http://www.opengis.net/wfs"\n'
			+ '  xmlns:wfs="http://www.opengis.net/wfs"\n'
			+ '  xmlns:gml="http://www.opengis.net/gml"\n'
			+ '  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n'
			+ '  xmlns:GTA23_project="http://www.gis.ethz.ch/GTA23_project" \n'
			+ '  xsi:schemaLocation="http://www.gis.ethz.ch/GTA23_project \n https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wfs?service=WFS&amp;version=1.0.0&amp;request=DescribeFeatureType&amp;typeName=GTA23_project%3Amarked_point\n'
			+ '                      http://www.opengis.net/wfs\n'
			+ '                      https://ikgeoserv.ethz.ch/geoserver/schemas/wfs/1.0.0/WFS-basic.xsd">\n'
			+ '  <wfs:Insert>\n'
			+ '    <GTA23_project:marked_point>\n'
			+ '      <marked_point_time>' + pt_time + '</marked_point_time>\n'
			+ '      <trip_id>' + trip_id + '</trip_id>\n'
			+ '      <geometry>\n'
			+ '        <gml:Point srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">\n'
			+ '          <gml:coordinates xmlns:gml="http://www.opengis.net/gml" decimal="." cs="," ts=" ">' + pt_lng + ',' + pt_lat + '</gml:coordinates>\n'
			+ '        </gml:Point>\n'
			+ '      </geometry>\n'
			+ '    </GTA23_project:marked_point>\n'
			+ '  </wfs:Insert>\n'
			+ '</wfs:Transaction>';

		// post the data to the geoserver
		$.ajax({
			type: "POST",
			url: gs.wfs,
			dataType: "xml",
			contentType: "text/xml",
			data: postData,
			success: function (xml) {
				// success feedback
				console.log("Marked Point uploaded");
			},
			error: function (xhr, ajaxOptions, thrownError) {
				// error handling
				console.log("Error from AJAX");
				console.log(xhr.status);
				console.log(thrownError);
			}
		});
	}

});

// closes alert window
function closePopup() {
	document.getElementById("popup_alert").style.display = "none";
	document.getElementById("popup_alert_marked_point").style.display = "none";
	document.getElementById("popup_alert_geolocaliation").style.display = "none";
  }
