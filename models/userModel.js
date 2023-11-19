const mongoose = require('mongoose');
const crypto = require('crypto');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, default: false },
    //role: { type: String, enum: ['client', 'contractor'], default: 'client' },
    isBlocked: { type: Boolean, default: false },
    address: { type: String, required: true },
    cart: { type: Array, default: [] },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    refreshToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetTokenExpires: { type: Date },
    passwordChangeAt: { type: Date }
}, { timestamps: true })

userSchema.plugin(passportLocalMongoose);

userSchema.methods.isPasswordSame = function (password) {
    return this.authenticate(password);
};

userSchema.methods.isPasswordMatch = function (password, hashedPassword) {
    return this.constructor.authenticate()(this, password, (err, user) => {
        return !err && user;
    });
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
    return resetToken;
};

userSchema.methods.hasPasswordChanged = function (JWTTimestamp) {
    if (this.passwordChangeAt) {
        const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    // False means password was not changed after the token was issued
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;