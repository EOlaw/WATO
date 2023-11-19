const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        count: { type: Number },
        color: { type: String }
    }],
    paymentIntent: {},
    orderStatus: {
        type: String,
        enum: ['Not Processed', 'Dispatched', 'Processing', 'Completed', 'Canceled', 'Delievered'],
        default: 'Not Processed'
    },

}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;