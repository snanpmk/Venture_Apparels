const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    offerTitle: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
    },
    discountPercent: {
        type: Number,
        required: true,
        default: 10
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActivated: {
        type: Boolean,
        default: false
    }
})

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
