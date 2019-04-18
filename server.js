'use strict';


require('dotenv').config();



//global constants
const PORT = process.env.PORT || 3000 ;
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg'); // postgres

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.error(error));

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

const SQL = {};
SQL.getLocation = 'SELECT * FROM locations WHERE search_query=$1'
SQL.insertLocation = 'INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)'

const API = {};
API.geoCode = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
API.darksky = 'https://api.darksky.net/forecast/';

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

  //user input - ex: if they type in Seattle...search_query = Seattle
  const search_query = request.query.data;
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${search_query}&key=${process.env.GEOCODE_API_KEY}`;
  client.query(SQL.getLocation, [search_query].then(result => {
    if(result.rows.length) {
      response.send(result.rows[0])
      console.log('oh we have your location')
    } else {
      sqlTableRowAdder(search_query, response)
      console.log('adding new location')
    }
  })
  )

  function sqlTableRowAdder(searchQuery, response){
    const url = `${API.geoCode}${searchQuery}&key=${process.env.GEOCODE_API_KEY}`;
    superagent.get(url).then(result => {
      const location = new Location(searchQuery, result.body.results[0]);
      response.send(location);
      console.log('got location from Google API, inserting into DATABASE');
      client.query(SQL.insertLocation, [location.search_query, location.formatted_query, location.latitude, location.longitude]);
    })
  }
  //grabLocationData = Full JSON file

  // const grabLocationData = require('./data/geo.json');
  superagent.get(URL).then(result => {
    // This if-statement will throw a 500 error in the console if you search a location that doesn't exist
    if(result.body.status === 'ZERO_RESULTS'){
      response.status(500).send('Sorry, something went wrong');
      return;
    }
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
