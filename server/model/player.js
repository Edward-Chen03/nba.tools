const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({


    name: { type: String },
    team: { type: String },
    positions: [{ type: String }],
    colleges: [{type: String}],
    bbrID: {type: String},
    birthDate: {type: Date},
    seasons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'seasonSummary' }]  

});

playerSchema.virtual('url').get(function () {
    return '/posts/player/' + this._id;
});

playerSchema.virtual('age').get(function () {
    if (!this.birthDate) return null;
  
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
  
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  });

module.exports = mongoose.model('Player', playerSchema);