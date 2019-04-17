'use strict';


require('dotenv').config();



//global constants
const PORT = process.env.PORT || 3000 ;
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

let responseDataObject = {};


//server definition
const app = express();
app.use(cors());

//server is doing this
app.get('/location', searchLocationData);

app.get('/weather', (request, response) => {
  response.send(searchWeatherData() );
})

//Constructor Functions
function LocationData(search_query, formatted_query, latitude, longitude){
  this.search_query = search_query;
  this.formatted_query = formatted_query;
  this.latitude = latitude;
  this.longitude = longitude;
}

function WeatherData(summary, time){
  this.forecast = summary;
  this.time = time;
}

//Other Functions
function searchLocationData(request, response) {
  //user input - ex: if they type in Seattle...search_quer = Seattle
  const search_query = request.query.data;
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${search_query}&key=${process.env.GEOCODE_API_KEY}`;
  //grabLocationData = Full JSON file
  /*
  {
    "results" : [
      {
        "address_components" : [
          {
            "long_name" : "Lynnwood",
            "short_name" : "Lynnwood",
            "types" : [ "locality", "political" ]
          },
          "formatted_address" : "Lynnwood, WA, USA",
          "geometry" : {
            "bounds" : {
              "northeast" : {
                "lat" : 47.85356789999999,
                "lng" : -122.261618
  */
  // const grabLocationData = require('./data/geo.json');
  superagent.get(URL).then(result => {
    const searchedResult = result.body.results[0];
    //formatted_query = "Lynnwood, WA, USA"
    const formatted_query = searchedResult.formatted_address;

    const latitude = searchedResult.geometry.location.lat;
    const longitude = searchedResult.geometry.location.lng;

    //Create new object containing user input data
    //responseDataObject = {Seattle, Lynnwood, WA, USA, somenumber, somenumber}
    responseDataObject = new LocationData(search_query, formatted_query, latitude, longitude);
    response.send(responseDataObject);
  });

}

function searchWeatherData() {
  //Grab all weather data
  /*
    ```
[
  {
    "forecast": "Partly cloudy until afternoon.",
    "time": "Mon Jan 01 2001"
  },
  {
    "forecast": "Mostly cloudy in the morning.",
    "time": "Tue Jan 02 2001"
  },
  ...
]
  */
  const grabWeatherData = require('./data/darksky.json');
  if(grabWeatherData.latitude === responseDataObject.latitude && grabWeatherData.longitude === responseDataObject.longitude){
    //dailyData = array of daily data objects
    let dailyData = grabWeatherData.daily.data;

    return dailyData.map((dailyDataObj) => {
      //summary = "Foggy in the morning."
      let summary = dailyDataObj.summary;
      //time = 1540018800; converted to standart time
      let time = new Date(dailyDataObj.time * 1000).toString().slice(0, 15) ;


      //For each entry within dailyData array
      //Create new weather object
      new WeatherData(summary, time);
    });
  }
}


// server start
app.listen(PORT, () => {
  console.log(`app is up on PORT ${PORT}`)
})
