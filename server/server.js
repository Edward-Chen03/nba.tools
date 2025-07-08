// Server Config File

// NPM Packages
const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const { MongoClient, ServerApiVersion, ObjectId, GridFSBucket } = require('mongodb');
const uri = process.env.NBAMONGO;
let mongoose = require('mongoose')

app.use(express.json());
app.use(cors());
const port = 3000;

let gfsBucket;
mongoose.connect(uri);
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log("DB connected!");
});

const playerIconsClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

playerIconsClient.connect()
  .then(() => {
    playerIconsDb = playerIconsClient.db('playericons');
    gfsBucket = new GridFSBucket(playerIconsDb, { bucketName: 'images' });
    console.log('Connected to playericons DB and GridFSBucket');
    app.listen(port, () => {
      console.log(`Local Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to playericons DB:', err);
  });


// Schemas 

let Player = require('./model/player.js')
let Season = require('./model/seasons.js')

// Homepage Table

app.get("/hometable", async (req, res) => {
  try {
    console.log("Fetching paginated leaderboard stats...");

    const seasonYear = parseInt(req.query.season) || 2025;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const topSeasons = await Season.aggregate([
      { $unwind: "$seasons" },

      {
        $match: {
          "seasons.season": seasonYear,
          "seasons.per_game.gp": { $gte: 50 }
        }
      },

      {
        $addFields: {
          totalContribution: {
            $add: [
              "$seasons.per_game.pts",
              "$seasons.per_game.ast",
              "$seasons.per_game.trb"
            ]
          }
        }
      },

      {
        $group: {
          _id: "$player_bbrID",
          bestSeason: { $first: "$seasons" },
          totalContribution: { $max: "$totalContribution" }
        }
      },

      {
        $project: {
          player_bbrID: "$_id",
          season: "$bestSeason.season",
          team: "$bestSeason.team",
          per_game: "$bestSeason.per_game",
          totalContribution: 1
        }
      },

      { $sort: { totalContribution: -1 } },

      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "players",         
          localField: "player_bbrID",
          foreignField: "bbrID",
          as: "playerObject"
        }
      },
      {
        $unwind: {
          path: "$playerObject",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          player_bbrID: 1,
          season: 1,
          team: 1,
          per_game: 1,
          totalContribution: 1,
          playerObject: 1  
        }
      }
    ]);

    res.send(topSeasons);
    console.log(`Sent leaderboard stats page ${page}`);
  } catch (err) {
    console.error("Error fetching paginated season stats:", err);
    res.status(500).send("Failed to fetch leaderboard data.");
  }
});

// Players Table

app.get("/playerstable", async (req, res) => {
  try {
    console.log("Fetching paginated player stats...");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const filter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const players = await Player.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.send(players);
    console.log(`Sent player stats page ${page}`);
  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).send("Failed to fetch players.");
  }
});

app.get("/players/:bbrID/seasons", async (req, res) => {
  try {
    const { bbrID } = req.params;
    console.log("Fetching season player stats...");
    const player = await Player.findOne({ bbrID })
      .populate("seasons") 
      .lean();

    if (!player) {
      return res.status(404).send("Player not found");
    }

    res.send(player.seasons); 
    console.log("Sent season player stats...");
  } catch (err) {
    console.error("Error fetching player seasons:", err);
    res.status(500).send("Failed to fetch player seasons.");
  }
});

// Customized Stats Table


app.post("/customstats", async (req, res) => {
  try {
    console.log("Preparing custom stats...")

    const {
      season = 2025,
      page = 1,
      limit = 20,
      stats = [
        { key: "pts", direction: "desc" },
        { key: "trb", direction: "desc" },
        { key: "ast", direction: "desc" }
      ]
    } = req.body;

    const skip = (page - 1) * limit;

    const contributionExpr = stats.map(stat =>
      stat.direction === "desc"
        ? `$seasons.per_game.${stat.key}`
        : { $multiply: [`$seasons.per_game.${stat.key}`, -1] }
    );

    const topSeasons = await Season.aggregate([
      { $unwind: "$seasons" },

      {
        $match: {
          "seasons.season": parseInt(season),
          "seasons.per_game.gp": { $gte: 50 }
        }
      },

      {
        $addFields: {
          totalContribution: { $add: contributionExpr }
        }
      },

      {
        $group: {
          _id: "$player_bbrID",
          bestSeason: { $first: "$seasons" },
          totalContribution: { $max: "$totalContribution" }
        }
      },

      {
        $project: {
          player_bbrID: "$_id",
          season: "$bestSeason.season",
          team: "$bestSeason.team",
          per_game: "$bestSeason.per_game",
          totalContribution: 1
        }
      },

      { $sort: { totalContribution: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },

      {
        $lookup: {
          from: "players",
          localField: "player_bbrID",
          foreignField: "bbrID",
          as: "playerObject"
        }
      },
      {
        $unwind: {
          path: "$playerObject",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          player_bbrID: 1,
          season: 1,
          team: 1,
          per_game: 1,
          totalContribution: 1,
          playerObject: 1
        }
      }
    ]);

    res.send(topSeasons);
    console.log(`Sent dynamic leaderboard for season ${season}, page ${page}`);
  } catch (err) {
    console.error("Error in /customstats:", err);
    res.status(500).send("Failed to fetch custom stat leaderboard.");
  }
});

// Explorer

// Player Icons

app.get('/player/icon/:id', async (req, res) => {
  try {
    const fileId = new ObjectId(req.params.id);

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
});

// Collections

app.get("/players", async (req, res) => {
  try {
    console.log("Preparing Player Document Data...");
    let players = await Player.find().lean();
    res.send(players);
    console.log("Player Document Data Sent!");
  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).send("Failed to fetch player data.");
  }
});

app.get("/seasons", async (req, res) => {
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
});