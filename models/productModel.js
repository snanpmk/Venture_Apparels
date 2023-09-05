const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }, 
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String, 
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  offerPrice:{
    type : Number,
    default : null,
  },
  offerPercent:{
    type: Number,
    default:null
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


productSchema.index({ name: 'text', description: 'text' });



const Product = mongoose.model("Product", productSchema);

module.exports = Product;