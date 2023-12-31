const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true
    },
    minimumSpend: {
        type: Number,
        required: true,
        default: 500
    },
    maxSpend:{
        type: Number,
        required: true,
        default: 100000
    },
    discount: {
        type: Number,
        required: true,
        default: 40,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    restricted: {
        type: Boolean,
        default: false,
    }
})

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;