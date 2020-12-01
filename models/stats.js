const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    browser: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    highScore: {
        type: Number,
        default: 1,
        required: true
    },
    totalEaten: {
        type: Number,
        default: 0,
        required: true
    },
    wins: {
        type: Number,
        default: 0,
        required: true
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;