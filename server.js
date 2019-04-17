'use strict';


require('dotenv').config();



//global constants
const PORT = process.env.PORT || 3000 ;
const express = require('express');
const cors = require('cors');

let responseDataObject = {};


//server definition
const app = express();
app.use(cors());

//server is doing this
app.get('/location', (request, response) => {
  response.send(searchLocationData(request.query.data) );
})

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
function searchLocationData(frontEndQuery) {
  //user input - ex: if they type in Seattle...search_quer = Seattle
  const search_query = frontEndQuery;

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
  const grabLocationData = require('./data/geo.json');

  //formatted_query = "Lynnwood, WA, USA"
  const formatted_query = grabLocationData.results[0].formatted_address;

  const latitude = grabLocationData.results[0].geometry.location.lat;
  const longitude = grabLocationData.results[0].geometry.location.lng;

  //Create new object containing user input data
  //responseDataObject = {Seattle, Lynnwood, WA, USA, somenumber, somenumber}
  responseDataObject = new LocationData(search_query, formatted_query, latitude, longitude);
  
  return responseDataObject;
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
    let results = [];

    for(let i = 0; i < dailyData.length; i++){
      //summary = "Foggy in the morning."
      let summary = dailyData[i].summary;
      //time = 1540018800; converted to standart time
      let time = new Date(dailyData[i].time * 1000).toString().slice(0, 15) ;


      //For each entry within dailyData array
      //Create new weather object
      let eachTime = new WeatherData(summary, time);
      //Save the results in an array
      results.push(eachTime);
    }

    return results;
  }
}


// server start
app.listen(PORT, () => {
  console.log(`app is up on PORT ${PORT}`)
})
