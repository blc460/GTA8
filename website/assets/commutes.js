var wfsUrl = "http://ikgeoserv.ethz.ch:8080/geoserver/GTA23_project/wfs";

// WFS-Parameter
var params = {
    service: "WFS",
    version: "2.0.0",
    request: "GetFeature",
    typeName: "GTA23_lab07_project",
    outputFormat: "application/json"
};

// AJAX-Anfrage
var xhr = new XMLHttpRequest();
xhr.open("GET", wfsUrl + '?' + new URLSearchParams(params), true);

// Setzen Sie CORS-Header, wenn erforderlich
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("Accept", "application/json");

// Callback für die Antwort
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        // Verarbeiten Sie die Antwort hier
        var response = JSON.parse(xhr.responseText);
        console.log(response);
    }
};

// Senden Sie die Anfrage
xhr.send();