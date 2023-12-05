document.addEventListener('DOMContentLoaded', function () {
    // Sample trip data
    var trips = [
        { name: 'Trip 1', location: 'City A' },
        { name: 'Trip 2', location: 'City B' },
        // Add more trips as needed
    ];

    var tripList = document.getElementById('trip-list');

    // Populate the trip list
    trips.forEach(function (trip) {
        var tripItem = document.createElement('li');
        tripItem.className = 'trip-item';
        tripItem.textContent = trip.name + ' - ' + trip.location;
        tripList.appendChild(tripItem);
    });
});