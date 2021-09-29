const { boolean, bool } = require('@hapi/joi');
const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
        min: 6,
        max: 255,
    },
    email: {
        type: String,
        require: true,
        max: 255,
        min: 6
    },
    gender: {
        type: String,
        require: true,
        max: 5,
        min: 5
    },
    password: {
        type: String,
        require: true,
        max: 2550,
        min: 6
    },
    emailToken: {
        type: String
    },
    isVerified:{
        type: Boolean

    },
    date: {
        type: Date,
        default: Date.now

    },
    resetToken:{
        type: String
    },
    expireToken:{
        type:Date
    }

});

module.exports = mongoose.model('User', userSchema);