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

function updateHTML(data) {
    var table = document.querySelector("table");
    var tbody = table.querySelector("tbody");

    // Clear existing data in the table body
    tbody.innerHTML = "";

    // Iterate over the received data and add rows to the table
    data.features.forEach(function (feature) {
        var row = tbody.insertRow();

        // Access the properties object
        var properties = feature.properties;

        // Assuming your table has three columns: trip_name, trip_transport_mode, trip_date_of_collection
        var columns = ["trip_name", "trip_transport_mode", "trip_date_of_collection"];

        // Add cells to the row for each column
        columns.forEach(function (column, index) {
            var cell = row.insertCell(index);
            cell.innerHTML = properties[column];
        });
    });
}

// Rufen Sie die Funktion auf, wenn das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", function () {
    getWfsData();
});
