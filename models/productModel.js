const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, required: true },
    sold: { type: Number, required: true },
    images: [{ public_id: String, url: String }],
    color: [],
    tags: { type: String },
    //code: { type: String, unique: true }, // Product Code (with 'unique' set to true)
    //availability: { type: String }, // Availability
    //type: { type: String }, // Type
    shipping: { type: String }, // Shipping
    ratings: [{ star: Number, comment: String, postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
    totalrating: { type: Number, default: 0 }, //Total rating score
    numRatings: { type: Number, default: 0 } // Number of ratings
}, { timestamps: true });

// Function to calculate the average rating for the product
productSchema.methods.calculateAverageRating = function () {
    if (this.numRatings === 0) {
        this.totalrating = 0;
    } else {
        const sum = this.ratings.reduce((total, rating) => total + rating.star, 0);
        this.totalrating = sum / this.numRatings;
    }
}
/*
productSchema.statics.searchProducts = async function (searchTerm) {
    try {
        const results = await this.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } }, //Case-insensitive search for title
                { description: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search for description
                // Add more fields to search if needed
            ]
        })
        return results
    } catch (err) {
        throw new Error(err.message)
    }
    
}
*/
const Product = mongoose.model('Product', productSchema);

module.exports = Product;