// function to get WFS-data
function getWfsData() {
    var wfsUrl = "https://ikgeoserv.ethz.ch/geoserver/GTA23_project/wfs";

    // WFS-parameter
    var params = {
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeName: "GTA23_project:trip",
        outputFormat: "application/json"
    };

    // AJAX-request
    var xhr = new XMLHttpRequest();
    xhr.open("GET", wfsUrl + '?' + new URLSearchParams(params), true);

    // set the CORS-header, if necessary
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");

    // callback for the response
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            console.log(response);

            // get the IP-adress of the user
            getUserIpAddress(function (userIpAddress) {
                // fixed IP-adress "111.111.111.111" for example trips
                var fixedIpAddress = "111.111.111.111";

                // filter the trips with the IP-adress
                var filteredTrips = response.features.filter(function (feature) {
                    return feature.properties.trip_ip_address === userIpAddress || feature.properties.trip_ip_address === fixedIpAddress;
                });

                // update the HTML-body with the filtered trips
                updateHTML({ features: filteredTrips });

                // add an eventlistener to every row
                addRowClickListener();
            });
        }
    };

    xhr.send();
}

// function to get the IP-adress of the user
function getUserIpAddress(callback) {
    $.getJSON("https://api.ipify.org/?format=json", function (data) {
        callback(data.ip);
    });
}

function updateHTML(data) {
    showLoadingOverlay();
    var table = document.querySelector("table");
    var tbody = table.querySelector("tbody");

    // clear existing data in the table body
    tbody.innerHTML = "";

    // sort the features array by trip ID
    data.features.sort(function (a, b) {
        var tripIdA = extractTripId(a);
        var tripIdB = extractTripId(b);
        return tripIdA - tripIdB;
    });

    // iterate over the sorted data and add rows to the table
    data.features.forEach(function (feature) {
        var row = tbody.insertRow();
        row.setAttribute("id", "trip_" + extractTripId(feature));

        // access the properties object
        var properties = feature.properties;

        var columns = ["trip_name", "trip_transport_mode", "trip_date_of_collection"];

        // add cells to the row for each column
        columns.forEach(function (column, index) {
            var cell = row.insertCell(index);

            // check if the current column is 'trip_date_of_collection'
            if (column === "trip_date_of_collection") {
                // format the date and time
                var formattedDate = formatDateTime(properties[column]);
                cell.innerHTML = formattedDate;
            } else {
                // for other columns, simply display the value
                cell.innerHTML = properties[column];
            }
        });
    });
    hideLoadingOverlay();
}

function formatDateTime(dateTimeString) {
    // parse the input date string
    var date = new Date(dateTimeString);

    // format the date and time
    var formattedDate = `${padZero(date.getDate())}.${padZero(date.getMonth() + 1)}.${date.getFullYear()} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;

    return formattedDate;
}

function padZero(value) {
    return value < 10 ? `0${value}` : value;
}

function addRowClickListener() {
    var table = document.querySelector("table");
    var tbody = table.querySelector("tbody");

    tbody.addEventListener("click", function (event) {
        var target = event.target;
    
        if (target.tagName === "TD") {
            // extract the trip_id out of the ID from the row
            var tripId = target.parentNode.id;
            // check if the tripId exists
            if (tripId) {
                // remove the prefix 'trip_' and convert it to a number
                var tripIdNumber = parseInt(tripId.replace("trip_", ""));
                console.log("Selected trip_id:", tripIdNumber);

                // open the category popup
                openCategoryPopup(tripIdNumber);
            }
        }
    });
}

function openCategoryPopup(tripIdNumber) {
    var categoryPopup = document.getElementById("categoryPopup");
    categoryPopup.style.display = "flex";

    // close the popup
    var closePopupBtn = document.getElementById("closeCategoryPopupBtn");
    closePopupBtn.onclick = function () {
        categoryPopup.style.display = "none";
    };

    // navigate based on the selected category
    function selectCategory(category) {
        categoryPopup.style.display = "none";
        console.log("Selected category:", category);
        navigateToLink(tripIdNumber, category);
    }

    // eventlistener for the category buttons
    var categoryButtons = document.getElementsByClassName("categoryButton");
    for (var i = 0; i < categoryButtons.length; i++) {
        categoryButtons[i].onclick = function () {
            selectCategory(this.getAttribute("data-category"));
        };
    }
}

function navigateToLink(tripIdNumber, category) {
    // complete the link with the tripIdNumber and category
    var link = "https://side-eye-vercel.vercel.app/get_id_list?trip_id=" + tripIdNumber + "&cat=" + category;
    var encodedLink = 'result.html?link=' + encodeURIComponent(link); 

    // open the created link
    window.location.href = encodedLink;
}

function extractTripId(feature) {
    var tripId = feature.id.split(".")[1]; // extract the numeric part of the TripId
    // check if the tripId is a number
    if (!isNaN(tripId)) {
        return parseInt(tripId);
    } else {
        // if not, give NaN back
        return NaN;
    }
}

// show the loading icon
function showLoadingOverlay() {
    $('#loading-overlay').show();
}

// hide the loading icon
function hideLoadingOverlay() {
    $('#loading-overlay').hide();
}

// call the function, when DOM is completely loaded
document.addEventListener("DOMContentLoaded", function () {
    getWfsData();
});
