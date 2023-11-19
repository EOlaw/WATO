const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            count: Number,
            color: String,
            price: Number
        }
    ],
    cartTotal: { type: Number, default: 0 },
    totalAfterDiscount: { type: Number },
    orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Define a discount percentage (e.g., 10%)
const discountPercentage = 0.1;
// Add a method to calculate the total price of items in the cart
cartSchema.methods.calculateCartTotals = function () {
    this.cartTotal = this.products.reduce((total, item) => {
        return total + item.price * item.count;
    }, 0);
    // Calculate the discount amount
    const discountAmount = this.cartTotal * discountPercentage;
    // Apply the discount
    this.totalAfterDiscount = this.cartTotal - discountAmount;
    return this.save();
};

// Add a method to add a product to the cart
cartSchema.methods.addProductToCart = function (product, count, color) {
    const productExists = this.products.some((item) => {
        return item.product.toString() === product._id.toString();
    });

    if (productExists) {
        this.products.forEach((item) => {
            if (item.product.toString() === product._id.toString()) {
                item.count += count;
            }
        });
    } else {
        this.products.push({
            product: product._id,
            count: count,
            color: color,
            price: product.price // You can add logic for discounted price here
        });
    }
    return this.save();
};

// Add a method to update the quantity and color of a product in the cart
cartSchema.methods.updateProductInCart = function (productId, count, color) {
    this.products.forEach((item) => {
        if (item.product.toString() === productId) {
            item.count = count;
            item.color = color;
        }
    });
    return this.save();
};

// Add a method to remove a product from the cart
cartSchema.methods.removeProductFromCart = function (productId) {
    this.products = this.products.filter((item) => item.product.toString() !== productId);
    return this.save();
};



const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
