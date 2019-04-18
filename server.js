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

app.get('/weather', searchWeatherData);

app.use('*', (request, response) => {
  response.send('Our server runs.');
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

  // const grabLocationData = require('./data/geo.json');
  superagent.get(URL).then(result => {
    if(result.body.status === 'ZERO_RESULTS'){
      response.status(500).send('Sorry, something went wrong');
      return;
    }
    const searchedResult = result.body.results[0];
    console.log(searchedResult);
    console.log(result.body);
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

function searchWeatherData(request, response) {

  const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  superagent.get(URL).then(result => {
    const latitudeRequest = Number(request.query.data.latitude);
    const longitudeRequest = Number(request.query.data.longitude);
    if(result.body.latitude === latitudeRequest && result.body.longitude === longitudeRequest){
      //dailyData = array of daily data objects
      let dailyData = result.body.daily.data;
      const dailyWeather = dailyData.map((dailyDataObj) => {
        //summary = "Foggy in the morning."
        let summary = dailyDataObj.summary;
        //time = 1540018800; converted to standart time
        let time = new Date(dailyDataObj.time * 1000).toString().slice(0, 15) ;

        //For each entry within dailyData array
        //Create new weather object
        new WeatherData(summary, time);
        return new WeatherData(summary, time);
      });
      response.send(dailyWeather);
    }
  })
}


// server start
app.listen(PORT, () => {
  console.log(`app is up on PORT ${PORT}`)
})
