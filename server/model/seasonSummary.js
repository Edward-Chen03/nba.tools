const mongoose = require('mongoose');

// SEASON AVERAGE

const seasonSummarySchema = new mongoose.Schema({
    
    season: {type: Number},
    team: {type: String},
    position: [{type: String}],
    gp: {type: Number},
    gs: {type: Number},
    mp: {type: Number},
    fg: {type: Number},
    fga: {type: Number},
    fgp: {type: Number},
    threep: {type: Number},
    threepa: {type: Number},
    threepap: {type: Number},
    twop: {type: Number},
    twopa: {type: Number},
    twopap: {type: Number}, 
    efgp: {type: Number},
    ft: {type: Number},
    fta: {type: Number},
    ftp: {type: Number},
    orb: {type: Number},
    drb: {type: Number},
    trb: {type: Number},
    ast: {type: Number},
    stl: {type: Number},
    blk: {type: Number},
    tov: {type: Number},
    pf: {type: Number},
    pts: {type: Number},
    awards: {type: String},
    games: [{ type: mongoose.Schema.Types.ObjectId, ref: 'individualGameStatistics' }] 
    
});

seasonSummarySchema.virtual('url').get(function(){
    return '/posts/seasonSummary/' + this._id;
});


module.exports = mongoose.model('seasonSummary', seasonSummarySchema);