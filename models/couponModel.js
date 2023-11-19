const mongoose = require('mongoose');

const couponModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    expiry: {
        type: Date,
        required: true
    },
    discount: {
        type: Number,
        required: true
    }
})

const Coupon = mongoose.model('Coupon', couponModel);

module.exports = Coupon;