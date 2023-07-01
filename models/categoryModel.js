  const mongoose = require("mongoose");

  const categorySchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    gender: [
      {
        type: String,
        enum: ["men", "women", "unisex"],
      },
    ],
    ageGroup: [
      {
        type: String,
        enum: ["adults", "kids", "infants"],
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    
  });
  // categorySchema.index({ categoryName: 1 }, { unique: true });

  const Category = mongoose.model("Category", categorySchema);

  module.exports = Category;
