
let Season = require('../model/seasons')

const getHomeTable = async (req, res) => {
    
  try {
    console.log("Fetching leaderboard stats...");

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
    console.log(`Sent leaderboard stats page ${page}!`);
  } catch (err) {
    console.error("Error fetching season stats:", err);
    res.status(500).send("Failed to fetch leaderboard data.");
  }

};

module.exports = {getHomeTable}
