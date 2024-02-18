const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userInfo = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    contactNumber: String,
},
{timestamps: true});

userInfo.plugin(plm);

module.exports = mongoose.model("Users for Expense Tracker App", userInfo);