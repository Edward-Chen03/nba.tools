let Player = require('../model/player.js')
let Season = require('../model/seasons.js')
const { ObjectId } = require('mongodb'); 
const { getGfsBucket, getPlayerIconsDb } = require('../config.js');

const getPlayerIcons = async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);
    const playerIconsDb = getPlayerIconsDb(); 
    const gfsBucket = getGfsBucket();
    
    const file = await playerIconsDb.collection('images.files').findOne({ _id: fileId });
    if (!file) {
      return res.status(404).send('Image not found');
    }
    res.set('Content-Type', file.contentType || 'image/jpeg');

    const downloadStream = gfsBucket.openDownloadStream(fileId);

    downloadStream.on('error', (err) => {
      console.error("Stream error:", err);
      res.status(500).send("Error streaming image");
    });

    downloadStream.pipe(res);

  } catch (err) {
    console.error("Invalid image ID:", err);
    res.status(400).send("Invalid image ID");
  }
};

const getPlayerByID = async (req, res) => {
  try {
    const { bbrID } = req.params;
    console.log(`Fetching player with bbrID: ${bbrID}...`);
    
    const player = await Player.findOne({ bbrID }).lean();
    
    if (!player) {
      return res.status(404).send("Player not found.");
    }

    res.send(player);
    console.log("Player data sent!");
  } catch (err) {
    console.error("Error fetching player:", err);
    res.status(500).send("Failed to fetch player data.");
  }
};

const getPlayersCollection = async (req, res) => {
  try {
    console.log("Preparing Player Document Data...");
    let players = await Player.find().lean();
    res.send(players);
    console.log("Player Document Data Sent!");
  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).send("Failed to fetch player data.");
  }
};

const getSeasonsCollection = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    console.log("Fetching paginated season data...");
    const seasons = await Season.find().skip(skip).limit(limit).lean();
    res.send(seasons);
    console.log("Season Document Data Sent!");
  } catch (err) {
    console.error("Error fetching seasons:", err);
    res.status(500).send("Failed to fetch season data.");
  }
};

module.exports = {getPlayerIcons, getPlayerByID, getPlayersCollection, getSeasonsCollection}