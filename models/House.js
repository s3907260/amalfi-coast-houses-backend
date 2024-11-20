const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Utils = require('./../utils')

// House Schema
const houseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String, 
    required: true   
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true    
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  garageSpots: {
    type: Number,
    required: true
  },
  freeWifi: {
    type: Boolean,
    required: true
  }
  
}, { timestamps: true, versionKey: false })


// Creation of the model
const housetModel = mongoose.model('House', houseSchema)

// Exporting the model
module.exports = housetModel

