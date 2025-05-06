const mongoose = require('mongoose');

// SEASON AVERAGE

const seasonsSchema = new mongoose.Schema({
    
    player_bbrID: {type: String},
    seasons: []
      
});

seasonsSchema.virtual('url').get(function(){
    return '/posts/seasons/' + this._id;
});


module.exports = mongoose.model('seasons', seasonsSchema);