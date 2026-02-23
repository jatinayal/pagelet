/**
 * User Model
 * ==========
 * 
 * Mongoose schema for user authentication.
 * 
 * Fields:
 * - name: User's display name
 * - email: Unique email address (used for login)
 * - password: Bcrypt-hashed password
 * - createdAt: Account creation timestamp
 * 
 * Security:
 * - Password is hashed before saving using bcrypt
 * - Password field is excluded from queries by default
 * - Includes method to compare passwords for login
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Exclude password from queries by default
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

/**
 * Pre-save middleware to hash password before storing.
 * Only runs if password field is modified (new or changed).
 * 
 * Note: In Mongoose 7+, async middleware doesn't need next().
 * Just return or throw - Mongoose handles it automatically.
 */
userSchema.pre('save', async function () {
    // Only hash if password is new or modified
    if (!this.isModified('password')) {
        return;
    }

    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

/**
 * Instance method to compare a candidate password with the stored hash.
 * Used during login to verify credentials.
 * 
 * @param {string} candidatePassword - Plain text password to verify
 * @returns {Promise<boolean>} True if password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Remove sensitive fields when converting to JSON.
 * Ensures password is never sent in API responses.
 */
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

// Prevent model recompilation in development (hot reload)
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
