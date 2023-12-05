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

            // Aktualisieren Sie den HTML-Body mit den erhaltenen Daten
            updateHTML(response);
        }
    };

    // Senden Sie die Anfrage
    xhr.send();
}

// Funktion zum Aktualisieren des HTML-Bodys mit den erhaltenen Daten
function updateHTML(data) {
    var tbody = document.getElementById("trip-table-body");

    // Löschen Sie vorhandene Daten in der Tabelle
    tbody.innerHTML = "";

    // Iterieren Sie über die erhaltenen Daten und fügen Sie die trip_id der Tabelle hinzu
    data.features.forEach(function (feature) {
        var row = tbody.insertRow();
        var cell = row.insertCell(0);

        // Annahme: Annahmen über die Struktur der Daten und das Attribut trip_id
        cell.innerHTML = feature.properties.trip_id;
    });
}

// Rufen Sie die Funktion auf, wenn das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", function () {
    getWfsData();
});
