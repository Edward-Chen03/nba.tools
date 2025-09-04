let Player = require('../model/player.js')
let Season = require('../model/seasons.js')

const getCustomStats = async (req, res) => {
  try {
    const {
      season = 2025,
      page = 1,
      limit = 20,
      stats = [],
      xAxis = ""
    } = req.body;

    if (!Array.isArray(stats) || stats.length === 0) {
      return res.status(400).send("Missing or invalid 'stats' array.");
    }

    const xAxisFieldMap = {
      games_played: "$seasons.per_game.gp",
      team: "$seasons.team",
      position: "$seasons.position"
    };

    const xAxisField = xAxisFieldMap[xAxis] || null;

    const totalExpression = {
      $add: stats.map(stat => ({
        $ifNull: [`$seasons.per_game.${stat.key.toLowerCase()}`, 0]
      }))
    };

    const projectFields = {
      player_bbrID: 1,
      season: "$seasons.season",
      per_game: "$seasons.per_game",
      total: totalExpression,
      gp: "$seasons.per_game.gp"
    };

    if (xAxisField) {
      projectFields.xAxis = xAxisField;
    }

    const pipeline = [
      { $unwind: "$seasons" },
      { $match: { "seasons.season": season } },
      { $project: projectFields },
      { $sort: { player_bbrID: 1, gp: -1 } }, 
      {
        $group: {
          _id: "$player_bbrID",
          doc: { $first: "$$ROOT" } 
        }
      },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { total: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    const results = await Season.aggregate(pipeline).exec();

    const playerIDs = results.map(r => r.player_bbrID);

    const players = await Player.find(
      { bbrID: { $in: playerIDs } },
      { bbrID: 1, name: 1, headshot_icon: 1 }
    ).lean();

    const playerMap = players.reduce((acc, player) => {
      acc[player.bbrID] = player;
      return acc;
    }, {});

    const enrichedResults = results.map(r => ({
      ...r,
      name: playerMap[r.player_bbrID]?.name || null,
      headshot: playerMap[r.player_bbrID]?.headshot_icon || null
    }));

    res.json(enrichedResults);

  } catch (err) {
    console.error("Error in /customstats:", err);
    res.status(500).send("Failed to fetch custom stat leaderboard.");
  }
};

module.exports = {getCustomStats}