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

//functions

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

function searchLocationData(frontEndQuery) {
  const search_query = frontEndQuery;

  const grabLocationData = require('./data/geo.json');
  const formatted_query = grabLocationData.results[0].formatted_address;
  const latitude = grabLocationData.results[0].geometry.location.lat;
  const longitude = grabLocationData.results[0].geometry.location.lng;

  responseDataObject = new LocationData(search_query, formatted_query, latitude, longitude);
  return responseDataObject;
}

function searchWeatherData() {
  const grabWeatherData = require('./data/darksky.json');
  console.log("From Weather Data: " + grabWeatherData.longitude);
  console.log("From object: " + responseDataObject.longitude);
  if(grabWeatherData.latitude === responseDataObject.latitude && grabWeatherData.longitude === responseDataObject.longitude){
    let dailyData = grabWeatherData.daily.data;
    let results = [];
    for(let i = 0; i < dailyData.length; i++){
      let summary = dailyData[i].summary;
      let time = new Date(dailyData[i].time * 1000).slice(1, 15) ;
      let eachTime = new WeatherData(summary, time);

      results.push(eachTime);
    }

    return results;
  }
}


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
```
*/



// server start
app.listen(PORT, () => {
  console.log(`app is up on PORT ${PORT}`)
})
