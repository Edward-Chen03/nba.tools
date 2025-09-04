let Player = require('../model/player.js')

const getPlayersTable = async (req, res) => {
  try {
    console.log("Fetching player stats...");
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
    console.log(`Sent player stats page ${page}!`);
  } catch (err) {
    console.error("Error fetching players:", err);
    res.status(500).send("Failed to fetch players.");
  }
};

const getPlayerSeasons = async (req, res) => {
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
    console.log("Sent season player stats!");
  } catch (err) {
    console.error("Error fetching player seasons:", err);
    res.status(500).send("Failed to fetch player seasons.");
  }
};

module.exports = {getPlayersTable, getPlayerSeasons}
