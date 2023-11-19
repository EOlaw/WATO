const express = require('express');
const router = express.Router();
const productCategoryControllers = require('../controllers/productCategoryController');
const { isAuthenticated, isAdmin } = require('../controllers/authController');

router.route('/')
    .get(productCategoryControllers.getAllProductCategories)
    .post(productCategoryControllers.createProductCategory);

router.route('/:id')
   .get(productCategoryControllers.getProductCategory)
   .put(productCategoryControllers.updatedProductCategory)
   .delete(productCategoryControllers.deleteProductCategory);


module.exports = productCategoryControllers;