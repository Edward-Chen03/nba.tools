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

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', function () {

  console.log("db connected!");

})
