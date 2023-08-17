const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
        type: String,
        
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
});

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;