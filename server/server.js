// Server Config File


// NPM Packages
const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.NBAMONGO;
let mongoose = require('mongoose')

app.use(express.json());
app.use(cors());
const port = 3000;
mongoose.connect(uri);
let db = mongoose.connection;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

let Player = require('./model/player.js')
let Season = require ('./model/seasons.js')
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', function () {

  console.log("db connected!");

})

// Per Game Sorting

app.get("/seasons/2024-2025", async (req, res) =>{

  let season = await Season.find();

  const season2024Stats = season.map(player => { const seasons2024 = player.seasons
          .filter(season => season.season === 2024)
          .map(season => ({
            team: season.team,
            per_game: season.per_game
          }));
          
          if (seasons2024.length > 0) {
            return {
              playerId: player._id,
              player_bbrID: player.player_bbrID,
              seasons: seasons2024
            };
          } else {
            return null; 
          }
  }).filter(player => player !== null);
  
  res.json(season2024Stats);

});

// Collections

app.get("/players", async (req, res) => {

  let players = await Player.find();
  
  res.send(players);

});

app.get("/seasons", async (req, res) => {

  let seasons = await Season.find();

  res.send(seasons);

});
