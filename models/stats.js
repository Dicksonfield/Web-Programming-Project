//Import mongoose
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Creates schema template for creation of monogodb database document
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

//Creates schema model
const User = mongoose.model("User", userSchema);
module.exports = User;