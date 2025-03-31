const mongoose = require('mongoose');

const individualGameStatisticsSchema = new mongoose.Schema({

    name: {type: String},
    rk: { type: Number },
    gcar: { type: Number },
    gtm: { type: Number },
    date: { type: Date },
    team: { type: String },
    location: {
        type: String,
        enum: ['home', 'away'] 
    },
    opponent: { type: String },
    result: { type: String }, 
    gs: { type: Boolean }, 
    mp: { type: String },
    fg: { type: Number },
    fga: { type: Number },
    fgPct: { type: Number },
    threeP: { type: Number },
    threePA: { type: Number },
    threePPct: { type: Number },
    twoP: { type: Number },
    twoPA: { type: Number },
    twoPPct: { type: Number },
    efgPct: { type: Number },
    ft: { type: Number },
    fta: { type: Number },
    ftPct: { type: Number },
    orb: { type: Number },
    drb: { type: Number },
    trb: { type: Number },
    ast: { type: Number },
    stl: { type: Number },
    blk: { type: Number },
    tov: { type: Number },
    pf: { type: Number },
    pts: { type: Number },
    gmsc: { type: Number },
    plusMinus: { type: Number }

});

individualGameStatisticsSchema.virtual('url').get(function () {
    return '/posts/individualgame/' + this._id;
});


module.exports = mongoose.model('individualGameStatistics', individualGameStatisticsSchema);