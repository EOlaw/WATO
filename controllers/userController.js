const User = require('../models/userModel')
const Product = require('../models/productModel')
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')

const userControllers = {
    // Register Page
    renderRegister: (req, res) => {
        res.render('users/register')
    },
    //Create a new user
    registerUser: async (req, res, next) => {
        try {
            const user = new User(req.body);
            await user.setPassword(req.body.password); //Use setPassword method provided by passport-local-mongoose to set the password
            await user.save();
            req.login(user, err => { //Automatically logs the user in once they are created
                if (err) return next(err);
                req.flash('success', 'Welcome to Wato!');
                res.redirect('/');
            })
        } catch (error) {
            req.flash('error', e.message);
            res.redirect('/user/register');
            //res.status(400).json({ error: error.message })
        }
    },
    // Login Page
    renderLogin: (req, res) => {
        res.render('users/login')
    },
    // Login
    loginUser: async (req, res) => {
        req.flash('success', 'welcome back!');
        const redirectUrl = req.session.returnTo || '/product';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    },
    // Logout
    logout: (req, res) => {
        req.logout((err) => {
            if (err) {
                // Handle any errors that occur during the logout process
                console.log(err);
            }
            req.flash('success', 'Goodbye!');
            res.redirect('/product');
        });
    },
    
    // Get all users
    getAllUsers: async (req, res, next) => {
        try {
            const users = await User.find();
            res.status(200).json({ users: users })
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Get a single user
    getUser: async (req, res, next) => {
        try {
            const user = await User.findById(req.params.id);
            res.status(200).json(user)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Update a user
    updateUser: async (req, res, next) => {
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' })
            }
            res.status(200).json(updatedUser)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Delete a user
    deleteUser: async (req, res, next) => {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.id);
            if (!deletedUser) {
                return res.status(404).json({ error: 'User not found' })
            }
            res.status(200).json(deletedUser)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Block a user
    blockUser: async (req, res, next) => {
        try {
            const blockedUser = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
            if (!blockedUser) {
                return res.status(404).json({ error: 'User not found' })
            }
            res.status(200).json(blockedUser)
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Unblock a user
    unblockUser: async (req, res, next) => {
        try {
            const unblockedUser = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
            if (!unblockedUser) {
                return res.status(404).json({ error: 'User not found' })
            }
            res.status(200).json(unblockedUser)
            } catch (error) {
                res.status(400).json({ error: error.message })
        }
    },
    // Update Password
    updatePassword: async (req, res) => {
        try {
            const { newPassword } = req.body;
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            user.password = newPassword; //Set the new password
            await user.save();
            res.status(200).json({ message: 'Password updated successfully' })
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Forget Password Token and Reset
    forgetPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            const resetToken = await user.createPasswordResetToken();
            // Send the reset token to the user via email or other methods
            // You may also implement email functionality to send the token.
            res.status(200).json({ message: 'Password reset token sent successfully' })
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },
    // Reset Password Token
    resetPasswordToken: async (req, res) => {
        try {
            const { token } = req.params;
            const { newPassword } = req.body;
            //Find a user with the provided reset token that has not yet expired
            const user = await User.findOne({
                passwordResetToken: token,
                passwordResetTokenExpires: { $gt: Date.now() }
            });
            // If no user is found, or if the reset token has expired, return an error
            if (!user) {
                return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
            }
            // Set the new password for the user
            user.password = newPassword;
            //Clear the reset token fields, as they are no longer valid
            user.passwordResetToken = undefined;
            user.passwordResetTokenExpires = undefined;
            //Save the user object with the new password
            await user.save();
            res.status(200).json({ message: 'Password reset successfully' })
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }
}

module.exports = userControllers