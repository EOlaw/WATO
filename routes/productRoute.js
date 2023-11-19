const express = require('express');
const router = express.Router();
const productControllers = require('../controllers/productController');
const { isAuthenticated, isAdmin } = require('../controllers/authController');

router.route('/autocomplete')
    .get(productControllers.autocomplete);

router.route('/new')
    .get(isAuthenticated, isAdmin, productControllers.renderProductPage)
router.route('/')
    .get(productControllers.getProducts)
    .post(isAuthenticated, isAdmin, productControllers.createProduct)
router.route('/:id')
    .get(productControllers.getProductById)
router.route('/:id/edit')
    .get(isAuthenticated, isAdmin, productControllers.editProduct)
router.route('/:id/update')
    .put(isAuthenticated, isAdmin, productControllers.updateProduct)
router.route('/:id/delete')
    .get(isAuthenticated, isAdmin, productControllers.deleteProduct)
// Inside your productRoutes.js file

router.route('/:id/wishlist')
    .post(productControllers.addToWishlist)
    .delete(productControllers.removeFromWishlist)

router.route('/:id/review')
    .post(productControllers.submitRating)

router.route('/:id/review/:reviewId')
   .put(productControllers.updateProductReview)
   .delete(productControllers.deleteProductReview)
   
module.exports = router;