$(document).ready(function () {
	console.log("ready!");

	// Map.

	var map = L.map('map', { zoomControl: false }).setView([46.79851, 8.23173], 6);

	L.tileLayer('https://api.maptiler.com/maps/ch-swisstopo-lbm/{z}/{x}/{y}.png?key=5GIyaQiOX7pA9JBdK5R8', {
		minZoom: 2,
		maxZoom: 20,
		attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		ext: 'png'
	}).addTo(map);

	map.locate({ setView: true, maxZoom: 16 });

	function onLocationFound(e) {
		var radius = e.accuracy;

		L.circle(e.latlng, radius).addTo(map);
	}

	map.on('locationfound', onLocationFound);

	function onLocationError(e) {
		alert(e.message);
	}

	map.on('locationerror', onLocationError);

	function toggleButton() {
		var buttonElement = document.getElementById("button");
		if (buttonElement.innerHTML === "Start") {
		  buttonElement.innerHTML = "Stop";
		  buttonElement.style.backgroundColor = "#000";
		} else {
		  buttonElement.innerHTML = "Start";
		  buttonElement.style.backgroundColor = '#444444';
		}
	  }
	  
	  // Fügen Sie das onclick-Ereignis dem Button hinzu
	  var button = document.getElementById("button");
	  button.onclick = toggleButton;


});


