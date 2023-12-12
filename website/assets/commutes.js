// Funktion, um WFS-Daten abzurufen und zu verarbeiten
function getWfsData() {
    var wfsUrl = "https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wfs";

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

            // Ermitteln Sie die IP-Adresse des Benutzers
            getUserIpAddress(function (userIpAddress) {
                // Feste IP-Adresse "111.111.111.111"
                var fixedIpAddress = "111.111.111.111";

                // Filtern Sie die Trips basierend auf den IP-Adressen
                var filteredTrips = response.features.filter(function (feature) {
                    return feature.properties.trip_ip_address === userIpAddress || feature.properties.trip_ip_address === fixedIpAddress;
                });

                // Aktualisieren Sie den HTML-Body mit den gefilterten Daten
                updateHTML({ features: filteredTrips });

                // Fügen Sie den Event Listener zu jeder Zeile hinzu
                addRowClickListener();
            });
        }
    };

    // Senden Sie die Anfrage
    xhr.send();
}

// Funktion zum Ermitteln der IP-Adresse des Benutzers
function getUserIpAddress(callback) {
    // Verwenden Sie jQuery, um die IP-Adresse des Benutzers abzurufen
    $.getJSON("https://api.ipify.org/?format=json", function (data) {
        // callback mit der erhaltenen IP-Adresse aufrufen
        callback(data.ip);
    });
}

function updateHTML(data) {
    var table = document.querySelector("table");
    var tbody = table.querySelector("tbody");

    // Clear existing data in the table body
    tbody.innerHTML = "";

    // Iterate over the received data and add rows to the table
    data.features.forEach(function (feature) {
        var row = tbody.insertRow();
        row.setAttribute("id", "trip_" + extractTripId(feature));

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

function addRowClickListener() {
    var table = document.querySelector("table");
    var tbody = table.querySelector("tbody");

    tbody.addEventListener("click", function (event) {
        var target = event.target;
        // Überprüfen Sie, ob das Ziel eine Zelle in einer Zeile ist
        if (target.tagName === "TD") {
            // Extrahieren Sie die trip_id aus der ID der Zeile
            var tripId = target.parentNode.id;
            // Überprüfen Sie, ob die trip_id vorhanden ist
            if (tripId) {
                // Entfernen Sie das Präfix "trip_" und konvertieren Sie die trip_id in eine Zahl
                var tripIdNumber = parseInt(tripId.replace("trip_", ""));
                console.log("Selected trip_id:", tripIdNumber);

                // Öffnen Sie das Kategorieauswahl-Popup
                openCategoryPopup(tripIdNumber);
            }
        }
    });
}

function openCategoryPopup(tripIdNumber) {
    var categoryPopup = document.getElementById("categoryPopup");
    categoryPopup.style.display = "flex";

    // Funktion zum Schließen des Popups
    var closePopupBtn = document.getElementById("closeCategoryPopupBtn");
    closePopupBtn.onclick = function () {
        categoryPopup.style.display = "none";
    };

    // Funktion zum Navigieren basierend auf der ausgewählten Kategorie
    function selectCategory(category) {
        categoryPopup.style.display = "none";
        console.log("Selected category:", category); // Hier wird die Kategorie in der Konsole protokolliert
        navigateToLink(tripIdNumber, category);
    }

    // Fügen Sie Event-Listener für die Kategorieauswahl-Buttons hinzu
    var categoryButtons = document.getElementsByClassName("categoryButton");
    for (var i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].onclick = function () {
            selectCategory(this.getAttribute("data-category"));
        };
    }
}

function navigateToLink(tripIdNumber, category) {
    // Ergänzen Sie den Link mit der tripIdNumber und der Kategorie als Parameter
    var link = "https://side-eye-vercel.vercel.app/get_id_list?trip_id=" + tripIdNumber + "&cat=" + category;
    var encodedLink = 'result.html?link=' + encodeURIComponent(link); // Übergabe von link als Parameter

    // Hier können Sie den Link verwenden oder weiterleiten, wie gewünscht
    window.location.href = encodedLink;
}




function extractTripId(feature) {
    var tripId = feature.id.split(".")[1]; // Extrahieren Sie den numerischen Teil der id
    // Überprüfen, ob die tripId eine Zahl ist
    if (!isNaN(tripId)) {
        return parseInt(tripId);
    } else {
        // Falls nicht, geben Sie NaN zurück oder behandeln Sie dies nach Bedarf
        return NaN;
    }
}


// Rufen Sie die Funktion auf, wenn das DOM vollständig geladen ist
document.addEventListener("DOMContentLoaded", function () {
    getWfsData();
});
