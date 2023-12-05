// save ip address
$.getJSON("https://api.ipify.org/?format=json", function (e) {
	trip["ip_address"] = e.ip;
	console.log(e.ip);
});

// TODO: complete the url for the WMS GetFeatureInfo request
let url = 'http://ikgeoserv.ethz.ch:8080/geoserver/GTA23_project/layer:trip'


// Fetch the result from the url. Add the result to an HTML table
fetch(url)
    .then((response) => response.text())
    .then((html) => {
        // Assuming the response is an HTML table, set it as the content of the table body
        var tableBody = document.querySelector('#trip-table tbody');
        tableBody.innerHTML = html;
    });