# SIDE-EYE

## Introduction
Side-Eye is a semesterproject in the lecture GTA from Carlos, Christian, Estelle and Niklas.

Link to the public [GitHubRepository](https://github.com/blc460/GTA8) with all the code. (Not necessary for users only for grading)

## How to use the app?
The app is shared under the following [URL](https://n.ethz.ch/~cblase/gta/index.html). Due to the implementation with vercel you can use all functionalitis through the website (no ned to share flask on localhost). As Default there is an example-trip you can test or you go out and explore the city of zurich by recording new trips on the maps page. As soon as you start recording a new trip you'll see a blinking red dot on the top left of your device.


<p float="left">
  <img src="pictures/homescreen.png" width="250" alt>
  <img src="pictures/picture-tracking.png" width="252" alt>
</p>

After you press the stop-button you'll see a popup window in which you can give more detail to your trip and save it to the database. Now the app switches from the map page to your commutes, here you should see your newly recorded trip. By clicking on your trip, you can choose if you would like to see restaurants or places of worship.

pictures of the popup, triplist ans poi selection

Now you can relive your trip and all the sights you saw along the way. ENJOY :)

picture of the example trip with the poi's

## Software Structure

<img src="pictures/analysis flowchart-group8.png" width="752" alt>

## Folderstructure Repository

### data_processing

This is exactly the same folder that is deployed to the vercel server. It contains the backand.py file which performs the buffer analysis of the trips, as well as the requirments and vercel settings. Currently there is another git repository which is directly connected to vercel you can access it through this [Link](https://github.com/eckertniklas/side-eye-vercel). 

### Database

The Database folder contains the csv files which are exported from openstreetmap. This data is stored in a postGIS-database, the upload and modification of the data was made using the load_db.ipynb code. The database itself was created in pgAdmin4 using the commands saved in table_creation.txt.

### website

The website folder contains all the .html- .css- .js-files as well as the graphics used on the webapp.