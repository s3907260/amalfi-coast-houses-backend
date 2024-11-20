const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Utils = require('./../utils')

// sReservation shema
const reservationSchema = new mongoose.Schema({
    propertyID: {
        type: mongoose.Schema.Types.ObjectId, // References another document
        ref: 'House', // The name of the model being referenced
        required: true
    },
    startDate: {
        type: Date, // Type for dates in Mongoose
        required: true
    }, 
    endDate: {
        type: Date, // Type for dates in Mongoose
        required: true
    },
    price: {
        type: Number,
        required: true
      },
    customerID: {
        type: mongoose.Schema.Types.ObjectId, // References another document
        ref: 'User', // The name of the model being referenced
        required: true
    }

}, { timestamps: true, versionKey: false })


// Creation of the model
const reservationModel = mongoose.model('Reservation', reservationSchema)

// Export the module
module.exports = reservationModel

