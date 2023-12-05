document.addEventListener('DOMContentLoaded', function () {
    // Function to fetch trips from GeoServer
    function fetchTrips() {
        $.ajax({
            type: "GET",
            url: 'http://ikgeoserv.ethz.ch:8080/geoserver/GTA23_project/wms', // Replace with your GeoServer URL
            dataType: "XML",
            success: function (data) {
                // Extract the trips from the GeoServer response
                var trips = extractTripsFromGeoServerResponse(data);

                // Populate the trip list
                var tripList = document.getElementById('trip-list');
                trips.forEach(function (trip) {
                    var tripItem = document.createElement('li');
                    tripItem.className = 'trip-item';
                    tripItem.textContent = trip.name + ' - ' + trip.location;
                    tripList.appendChild(tripItem);
                });
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("Error fetching trips from GeoServer");
                console.log(xhr.status);
                console.log(thrownError);
            }
        });
    }

    // Function to extract trips from GeoServer response
    function extractTripsFromGeoServerResponse(geoServerResponse) {
        // Implement the logic to extract trips from the GeoServer response
        // This will depend on the structure of your GeoServer response
        // Modify this function based on the actual structure of your data
        var trips = []; // Placeholder, replace with actual logic
        return trips;
    }

    // Fetch trips when the page loads
    fetchTrips();
});