const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
    referredFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    referralCode: {
        type: String,
        required: true,
        unique: true, // Ensure each referral code is unique
    },
    referredTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: "",
    },
    isValid: {
        type: Boolean,
        default: true, // Default to valid; you can change it as needed
    },
    createdAt: {
        type: Date,
        default: Date.now, // Store the date when the referral was created
    },
});

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
