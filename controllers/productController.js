const Product = require('../models/productModel')
const User = require('../models/userModel')
const slugify = require('slugify');
const { search } = require('../routes/homeRoute');

const productControllers = {
    // Create a new product page
    renderProductPage: (req, res) => {
        res.render('products/new')
    },
    // Create a new product
    createProduct: async (req, res, next) => {
        try {
            if (req.body.title) {
                req.body.slug = slugify(req.body.title);
            }
            const images = JSON.parse(req.body.images);

            const newProduct = new Product({
                title: req.body.title,
                slug: req.body.slug,
                description: req.body.description,
                postedBy: req.user._id,
                price: req.body.price,
                category: req.body.category,
                brand: req.body.brand,
                quantity: req.body.quantity,
                sold: req.body.sold,
                images: images,
                color: req.body.color,
                tags: req.body.tags,
                ratings: [],
                totalrating: 0,
                numRatings: 0
            });
            await newProduct.save();
            //res.status(201).json({ message: 'Product created successfully', product: newProduct });
            res.redirect('/product/')
        } catch (err) {
            res.status(400).json({ error: err.message })
        }
    },
    // Get all products
    getProducts: async (req, res, next) => {
        try {
            // Define default query options
            let queryOptions = {};
            //Filtering
            if (req.query.category) {
                queryOptions.category = req.query.category;
            }
            if (req.query.brand) {
                queryOptions.brand = req.query.brand;
            }
            // Sorting
            let sortOptions = { createdAt: -1 }; // Default sort by creation date

            if (req.query.sortBy) {
            sortOptions = {}; // Clear default sort options

            if (req.query.sortOrder && req.query.sortOrder === 'asc') {
                sortOptions[req.query.sortBy] = 1; // Ascending order
            } else {
                sortOptions[req.query.sortBy] = -1; // Descending order (default)
            }
            }

            // Limiting fields
            //let selectFields = '-ratings'; // Default: Exclude ratings field
            let selectFields = ''; // Default: Include all fields
            if (req.query.fields) {
            selectFields = req.query.fields.split(',').join(' '); // Include only specified fields
            }

            // Pagination
            const page = parseInt(req.query.page, 10) || 1; // Default page: 1
            const limit = parseInt(req.query.limit, 10) || 10; // Default limit: 10
            const skip = (page - 1) * limit;

            // Execute the query
            const products = await Product.find(queryOptions)
            .sort(sortOptions)
            .select(selectFields)
            .skip(skip)
            .limit(limit);

            // Count total products (for pagination)
            const totalProducts = await Product.countDocuments(queryOptions);
            /*
            res.json({
            totalProducts,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            products,
            });
            */
            res.render('products/products', { products, totalProducts, currentPage: page, totalPages: Math.ceil(totalProducts / limit)})
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Get a single product
    getProductById: async (req, res, next) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }
            // Check if the user is the owner of the product (if user is authenticated)
            let isOwner = false;
            if (product.postedBy && req.user) { // Check if product.owner exists before comparing
                isOwner = product.postedBy.toString() === req.user._id.toString();
            }
            //res.json({product})
            res.render('products/product', { product, isOwner });
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Edit a product
    editProduct: async (req, res, next) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }
            // Check if the user is the owner of the product
            if (product.postedBy.toString()!== req.user._id.toString()) {
                return res.status(401).json({ error: 'You are not the owner of this product' })
            }
            // Check if the user is the owner of the product or if the user is isAdmin
            if (req.user._id.toString()!== product.postedBy.toString() &&!req.user.isAdmin) {
                res.status(403).json({ error: 'You are not the owner of this product' })
            } else {
                return res.render('products/edit', { product });
            }
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Update a product
    updateProduct: async (req, res, next) => {
        try {
            if (req.body.title) {
                req.body.slug = slugify(req.body.title);
            }
            const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedProduct) {
                return res.status(404).json({ error: 'Product not found' })
            }
            // Flash a success message to the user
            req.flash('success', 'Product updated successfully');
            res.redirect(`/product/${req.params.id}`);
        } catch (error) {
            req.flash('error', 'Something went wrong');
            res.status(400).json({ error: error.message })
        }
    },
    // Delete a product
    deleteProduct: async (req, res, next) => {
        try {
            const deletedProduct = await Product.findByIdAndRemove(req.params.id);
            if (!deletedProduct) {
                return res.status(404).json({ error: 'Product not found' })
            }
            console.log('Deleted product:', deletedProduct);
            req.flash('success', 'Product deleted');
            res.redirect('/product');
        } catch (error) {
            req.flash('error', 'Something went wrong');
            res.status(400).json({ error: error.message })
        }
    },
    // Search a product by its name and description
    autocomplete: async (req, res, next) => {
        try {
            const searchTerm = req.query.q;
            if (!searchTerm) {
                return res.status(400).json({ error: 'Search term is requried'} )
            }
            // Use a case-insensitive regex for the search
            const regex = new RegExp(searchTerm, 'i');
            // Serch for products that match the query
            const products = await Product.find({
                $or: [
                    { title: { $regex: regex } },
                    // Add more fields to search if needed
                ]
            }).limit(5) //Limit the number of results
            // Render a simple list of product titles (you can customize this)
            const autocompleteResults = products.map(product => `<li><a href="/product/${product._id}">${product.title}</a></li>`).join('')
            res.send(`<ul>${autocompleteResults}</ul>`);
        } catch (error) {
            console.error('Autocomplete error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    /*
    // Search products
    searchProducts: async (req, res, next) => {
        try {
            const searchTerm = req.query.q; // Get the search term from the query parameter
            if (!searchTerm) {
                return res.status(400).json({ error: 'Search term is require' })
            }
            // Call the static searchProducts method from the model
            const searchResults = await Product.searchProducts(searchTerm);
            //res.json({ products: searchResults })
            res.render('products/searchResults', { products: searchResults, searchTerm })
        } catch (error) {
            console.log('Error during search:', error)
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    */
    // Add to wishlist
    addToWishlist: async (req, res, next) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            // Check if the product is already in the user's wishlist to avoid duplicates
            if (user.wishlist.includes(product._id)) {
                return res.json({ message: 'Product is already in the wishlist' });
            }
            const wishlist = user.wishlist;
            wishlist.push(product._id);
            user.wishlist = wishlist;
            await user.save();
            res.status(200).json({added: user})
        } catch (error) {
            console.log(error);
            res.status(400).json({ error: error.message })
        }
    },
    // Remove from wishlist
    removeFromWishlist: async (req, res, next) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found'})
            }
            // Check if the product is already in the user's wishlist
            const productIndex = user.wishlist.indexOf(product._id);
            if (productIndex === -1) {
                return res.json({ message: 'Product is not in the wishlist' });
            }
            // Remove the product from the user's wishlist
            user.wishlist.splice(productIndex, 1);
            await user.save();
            res.status(200).json({removed: user})
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Submit a product rating
    submitRating: async (req, res, next) => {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            const rating = {
                star: req.body.star,
                comment: req.body.comment,
                postedBy: req.user.id
            }
            const newRating = product.ratings.push(rating); // Add the rating to the product
            product.numRatings++; // Increment the number of ratings
            product.calculateAverageRating(); // Calculate the average rating
            await product.save();
            res.redirect(`/product/${req.params.id}/review`);
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Update a product review
    updateProductReview: async (req, res, next) => {
        try {
            const { productId, reviewId } = req.params;
            const { star, comment } = req.body;
            const user = req.user.id; // Get the logged in user id
            // Find the product
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }
            // Find the user's review within the product's ratings
            const reviewIndex = product.ratings.find((rating) => rating.postedBy.equals(user));
            if (!reviewIndex) {
                return res.status(404).json({ error: 'Review not found' })
            }
            // Update the review
            reviewIndex.star = star;
            reviewIndex.comment = comment;
            // Recalculate the average rating for the product
            product.calculateAverageRating();
            await product.save(); // Save the updated product
            res.redirect(`/product/${productId}/review`);
        } catch (err) {
            res.status(400).json({ error: err.message })
        }
    },
    deleteProductReview: async (req, res, next) => {
        try {
            const { productId, reviewId } = req.params;
            const user = req.user.id; // Get the logged in user id
            // Find the product
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' })
            }
            // Find the user's review within the product's ratings
            const userReviewIndex = product.ratings.findIndex((rating) => rating.postedBy.equals(user._id));
            if (userReviewIndex === -1) {
            return res.status(404).json({ error: 'Review not found' });
            }
            // Remove the review
            product.ratings.splice(userReviewIndex, 1);
            product.calculateAverageRating();
            await product.save(); // Save the updated product
            res.redirect(`/product/${productId}/review`);
        } catch (err) {
            res.status(400).json({ error: err.message })
        }
    }

}

module.exports = productControllers;