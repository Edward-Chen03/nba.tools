const express = require('express')
const router = express.Router()

// Homepage Routes 

const {getHomeTable} = require('../components/homepage.js')

router.get('/hometable', getHomeTable)

// Playerpage Routes

const {getPlayersTable, getPlayerSeasons} = require('../components/playerspage.js')

router.get('/playerstable', getPlayersTable)
router.get('/players/:bbrID/seasons', getPlayerSeasons)

// Explorepage Routes

const {getCustomStats} = require('../components/explorerpage.js')

router.post('/customstats', getCustomStats)

// Foresightpage Routes

const {getPrediction} = require('../components/foresightpage.js')

router.post('/predict', getPrediction)

// General

const {getPlayerIcons, getPlayerByID, getPlayersCollection, getSeasonsCollection} = require('./general.js')

router.get('/player/icon/:id', getPlayerIcons)
router.get('/players/:bbrID', getPlayerByID)
router.get('/players', getPlayersCollection)
router.get('/seasons', getSeasonsCollection)

module.exports = router;
