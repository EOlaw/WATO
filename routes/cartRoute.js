const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.route('/addtocart/:productId')
    .post(cartController.addToCart);

router.route('/updatecartitem/:productId')
    .put(cartController.updateCartItem);
   
router.route('/removecartitem/:productId')
    .delete(cartController.removeCartItem);
   
router.route('/viewcart')
    .get(cartController.viewCart);
  
router.route('/carttotal')
    .get(cartController.getCartTotal);
 
router.route('/applycartdiscount')
    .post(cartController.applyCartDiscount);

router.route('/emptycart')
    .delete(cartController.emptyCart);
 
router.route('/placeorder')
    .post(cartController.placeOrder);

module.exports = router;