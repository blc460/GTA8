$(document).ready(function () {
	console.log("ready!");

	// create and display map --------------------------------------------------------------------

	var map = L.map('map', { zoomControl: false }).setView([46.79851, 8.23173], 6);

	L.tileLayer('https://api.maptiler.com/maps/ch-swisstopo-lbm/{z}/{x}/{y}.png?key=5GIyaQiOX7pA9JBdK5R8', {
		minZoom: 2,
		maxZoom: 20,
		attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a> <a href="https://www.swisstopo.admin.ch/en/home.html" target="_blank">&copy; swisstopo</a>',
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

	// trip visualisation: ---------------------------------------------------------------

	// create a URLSearchParams-object to find the URL-parameters
	var urlParams = new URLSearchParams(window.location.search);

	// read the link
	var linkParam = urlParams.get("link");

	// check if the parameter is available
	if (linkParam) {
		console.log("Link parameter found:", linkParam);
		processLink(linkParam);
	} else {
		console.log("Link parameter not found.");
	}

	function processLink(link) {
		// show the loading icon
		showLoadingOverlay();

		$.ajax({
			// URL to the Vercel production deployment
			url: link,
			type: 'GET',
			dataType: 'JSON',
			success: function (data) {
				// save the data in a global variable
				responseData = data;
				console.log(responseData);

				// check 'cat' in the link and start the corresponding function
				var urlParams = new URLSearchParams(link);
				console.log(urlParams);
				var catParam = urlParams.get("cat");
				console.log(catParam)

				// check 'trip_id' in the link and start the corresponding function
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
					// start the displayTrip-function, if trip_id is available in the link
					displayTrip([tripIdParam]);
				}
				// when finished, hide the loading icon
				hideLoadingOverlay();
			},
			error: function (data) {
				console.log(data);
				// if an error occurs, also hide the loading icon
				hideLoadingOverlay();
			},
		});
	}

	// icons ------------------------------------------
	var pois = L.icon({
		iconUrl: 'assets/SVG/pois.png',
		iconSize: [30, 45],
		iconAnchor: [15, 45],
		popupAnchor: [0, -45]
	});

	var marked = L.icon({
		iconUrl: 'assets/SVG/marked.png',
		iconSize: [30, 45],
		iconAnchor: [15, 45],
	});

	function getAddress(address_id){

	}

	function displayRestaurants(data) {
		data.forEach(function (restaurantId) {
			// call the information for every restaurant with the corresponding id
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
					// read data from restaurantData
					var coordinates = restaurantData.features[0].geometry.coordinates;
					var restaurantName = restaurantData.features[0].properties.restaurant_name;
					var address_id = restaurantData.features[0].properties.address_id;
					var restaurantWebsite = restaurantData.features[0].properties.restaurant_website;

					var address = getAddress(address_id);

					// add a marker for the restaurant
					var marker = L.marker([coordinates[1], coordinates[0]], { icon: pois }).addTo(map);

					// add a popup to the marker
					// marker.bindPopup(restaurantName + '</br>' + address + '</br>' + restaurantWebsite);
					marker.bindPopup(restaurantName + '</br>' + restaurantWebsite);
				},
				error: function (error) {
					console.log(error);
				},
			});
		});
	}

	function displayChurch(data) {
		data.forEach(function (churchId) {
			// call the information for every church with the corresponding id
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
					var coordinates = churchData.features[0].geometry.coordinates;
					var churchName = churchData.features[0].properties.church_name;
					var address_id = churchData.features[0].properties.address_id;

					var address = getAddress(address_id);

					// add a marker for the church
					var marker = L.marker([coordinates[1], coordinates[0]], { icon: pois }).addTo(map);

					// add a popup to the marker
					// marker.bindPopup(churchName + '</br>' + address);
					marker.bindPopup(churchName);
				},
				error: function (error) {
					console.log(error);
				},
			});
		});
	}

	function displayTrip(data) {
		data.forEach(function (tripId) {
			// call the information for every trip with the corresponding id
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
					var coordinates = tripData.features[0].geometry.coordinates;

					// add a polyline for the trip
					var polyline = L.polyline(coordinates.map(function (coord) {
						return [coord[1], coord[0]];
					})).addTo(map);

					// zoom to the polyline
					map.fitBounds(polyline.getBounds());

					// call the information for every markedpoint with the corresponding tripId
					$.ajax({
						url: 'https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wms',
						type: 'GET',
						data: {
							service: 'WFS',
							request: 'GetFeature',
							typeName: 'marked_point',
							outputFormat: 'application/json',
							featureID: tripId,
						},
						dataType: 'JSON',
						success: function (mark) {

							var coordinates = mark.features[0].geometry.coordinates;

							L.marker([coordinates[1], coordinates[0]], { icon: marked }).addTo(map);
						},
						error: function (error) {
							console.log(error);
						},
					});
				},
				error: function (error) {
					console.log('Error fetching trip data:', error);
				},
			});
		});
	}

	// show the loading icon
	function showLoadingOverlay() {
		$('#loading-overlay').show();
	}

	// hide the loading icon
	function hideLoadingOverlay() {
		$('#loading-overlay').hide();
	}

});