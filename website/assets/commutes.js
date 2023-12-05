// Funktion, um WFS-Daten abzurufen und zu verarbeiten
function getWfsData() {
    var wfsUrl = "http://ikgeoserv.ethz.ch:8080/geoserver/GTA23_project/wfs";

    // WFS-Parameter
    var params = {
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeName: "GTA23_project:trip",
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
            // Hier können Sie die Antwort in die Tabelle einfügen
            // z.B., durch Iteration über die Daten und Erstellen von <tr> und <td> Elementen
        }
    };

    // Senden Sie die Anfrage
    xhr.send();
}

// Rufen Sie die Funktion auf, wenn das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", function () {
    getWfsData();
});
