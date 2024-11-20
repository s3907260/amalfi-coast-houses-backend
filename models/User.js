const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Utils = require('./../utils')
require('mongoose-type-email')

//Schema for the users
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true
    },
    accessLevel: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
    },
    avatar: {
        type: String
    },
    newUser: {
        type: Boolean,
        default: true
    }
}, { timestamps: true, versionKey: false })


// encrypt password field on save
userSchema.pre('save', function (next) {
    // check if password is present and is modifed  
    if (this.password && this.isModified()) {
        this.password = Utils.hashPassword(this.password);
    }
    next()
})

// Creation of the model
const userModel = mongoose.model('User', userSchema)

// Exporting the module
module.exports = userModel




