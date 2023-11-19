const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const cartController = {
      // View cart contents
      viewCart: async (req, res, next) => {
        // Implement logic to retrieve and display the contents of the cart
        try {
            // Retrieve the user's cart
            const cart = await Cart.findOne({ orderedBy: req.user._id });
            if (!cart) {
                return res.json({ message: 'Cart is empty' });
            }
            res.render('carts/viewCart', { cart });
            //res.json(cart);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Add item to cart
    addToCart: async (req, res, next) => {
        try {
            const { productId } = req.params; // Get the productId from the URL parameter
            const product = await Product.findById(productId); // Use the productId from the URL
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            let cart = await Cart.findOne({ orderedBy: req.user._id });
            if (!cart) {
                cart = new Cart({ orderedBy: req.user._id, cartTotal: 0 });
            }
            if (cart.products.length === 0) {
                // Cart is empty; set cartTotal to 0 or any other appropriate value
                cart.cartTotal = 0;
                cart.totalAfterDiscount = 0; // Make sure to update totalAfterDiscount as well
            } else {
                // Calculate cart totals
                await cart.calculateCartTotals();
            }
            const existingProductIndex = cart.products.findIndex(item => item.product.toString() === productId);
            if (existingProductIndex !== -1) {
                // Update the quantity and color of the existing product in the cart
                cart.products[existingProductIndex].count += req.body.quantity;
                cart.products[existingProductIndex].color = req.body.color;
            } else {
                cart.products.push({
                    product: productId, // Use the productId from the URL
                    count: req.body.quantity,
                    color: req.body.color,
                    price: product.price,
                });
            }
            // Recalculate cart totals
            await cart.calculateCartTotals();
            // Save the new cart instance
            await cart.save();
            res.redirect('/cart/viewCart');
            //res.json({ message: 'Product added to cart', cart });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Update item in cart
    updateCartItem: async (req, res, next) => {
        try {
            const { productId } = req.params; // Get the productId from the URL parameter
            const { quantity, color } = req.body;
            const cart = await Cart.findOne({ orderedBy: req.user._id });
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }
            const itemToUpdate = cart.products.find(item => item.product.toString() === productId);
            if (!itemToUpdate) {
                return res.status(404).json({ error: 'Item not found in the cart' });
            }
            // Update the quantity and color of the selected product
            itemToUpdate.count = quantity;
            itemToUpdate.color = color;
            // Recalculate cart totals
            await cart.calculateCartTotals();
            await cart.save();
            res.json({ message: 'Cart item updated', cart });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },



    // Remove item from cart
    removeCartItem: async (req, res, next) => {
        try {
            const productId = req.params.productId; // The productId is specified in the URL
            const cart = await Cart.findOne({ orderedBy: req.user._id });
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }
            // Find the specific item with the provided productId and remove it
            const itemToRemove = cart.products.find(item => item.product.toString() === productId);
            if (!itemToRemove) {
                return res.status(404).json({ error: 'Item not found in the cart' });
            }
            // Remove the item from the cart
            cart.products = cart.products.filter(item => item.product.toString() !== productId);
            // Recalculate cart totals
            await cart.calculateCartTotals();
            await cart.save();
            res.json({ message: 'Cart item removed', cart });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Calculate cart total
    getCartTotal: async (req, res, next) => {
        // Implement logic to calculate the total price of items in the cart
        try {
            // Find the user's cart
            const cart = await Cart.findOne({ orderedBy: req.user._id });
            if (!cart) {
                return res.json({ message: 'Cart is empty' });
            }
            // Calculate the cart total
            const cartTotal = cart.calculateCartTotal();
            res.json({ cartTotal });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Apply cart discount
    applyCartDiscount: async (req, res, next) => {
        // Implement logic to apply discounts or promotions to the cart
        try {
            const { discountAmount } = req.body;
            // Find the user's cart
            const cart = await Cart.findOne({ orderedBy: req.user._id });
            if (!cart) {
                return res.json({ message: 'Cart is empty' });
            }
            // Check if the cart is empty
            if (cart.products.length === 0) {
                return res.json({ message: 'Cart is empty' });
            }
            // Check if the discount amount is valid
            if (discountAmount <= 0) {
                return res.json({ message: 'Invalid discount amount' });
            }
            // Apply the custom discount amount
            // Use the calculateCartTotals method instead of calculateCartTotal
            cart.calculateCartTotals(); // Recalculate cart totals
            // Apply the discount
            cart.totalAfterDiscount = cart.totalAfterDiscount - discountAmount;
            // Make sure the totalAfterDiscount does not go below zero
            if (cart.totalAfterDiscount < 0) {
                cart.totalAfterDiscount = 0;
            }
            await cart.save();
            res.json({ message: 'Discount applied', cart });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    // Clear cart
    emptyCart: async (req, res, next) => {
        // Implement logic to remove all items from the cart, effectively emptying it
        try {
            // Find the user's cart and remove all items
            const cart = await Cart.findOne({ orderedBy: req.user._id });
            if (!cart) {
                return res.json({ message: 'Cart is already empty' });
            }
            cart.products = []; // Empty the products array
            cart.cartTotal = 0; // Reset the cart total
            cart.totalAfterDiscount = 0; // Reset the total after discount
            await cart.save();
            res.json({ message: 'Cart is now empty' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    // Checkout and place an order
    placeOrder: async (req, res, next) => {
        // Implement logic to process the order and payment for the items in the cart
        try {
            // Find the user's cart
            const cart = await Cart.findOne({ orderedBy: req.user._id });
            if (!cart) {
                return res.json({ message: 'Cart is empty' });
            }
            // Additional logic for order processing and payment handling
            // For example, you may integrate with a payment gateway and create an order record
            // You can also send order confirmation emails, generate invoices, etc.

            // For this example, we'll just clear the cart to simulate placing an order
            cart.products = []; // Empty the products array
            cart.cartTotal = 0; // Reset the cart total
            cart.totalAfterDiscount = 0; // Reset the total after discount
            await cart.save();
    
            res.json({ message: 'Order placed successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = cartController