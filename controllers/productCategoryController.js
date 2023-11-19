const ProductCategory = require('../models/productCategoryModel');

const productCategoryControllers = {
    // Create a new product category
    createProductCategory: async (req, res, next) => {
        try {
            const newCategory = new ProductCategory(req.body);
            await newCategory.save();
            res.status(200).json(newCategory);
        } catch (error) {
            res.status(400).json({ error: error.message})
        }
    },
    // Get all product categories
    getAllProductCategories: async (req, res, next) => {
        try {
            const categories = await ProductCategory.find();
            res.status(200).json({ categories: categories })
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Get a single product category
    getProductCategory: async (req, res, next) => {
        try {
            const category = await ProductCategory.findById(req.params.id);
            res.status(200).json(category)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Update a product category
    updatedProductCategory: async (req, res, next) => {
        try {
            const updatedCategory = await ProductCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedCategory) {
                return res.status(404).json({ error: 'Category not found' })
            }
            res.status(200).json(updatedCategory)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }, 
    // Delete a product category
    deleteProductCategory: async (req, res, next) => {
        try {
            const deletedCategory = await ProductCategory.findByIdAndDelete(req.params.id);
            if (!deletedCategory) {
                return res.status(404).json({ error: 'Category not found' })
            }
            res.status(200).json(deletedCategory)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }
}