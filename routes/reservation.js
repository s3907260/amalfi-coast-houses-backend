
const express = require('express')
const router = express.Router()
const Utils = require('../utils')
const Reservation = require('../models/Reservation')
const path = require('path')

// GET- get all reservations ---------------------------
router.get('/', Utils.authenticateToken, (req, res) => {
  //Retrieve all the reservations and return them in the response
  Reservation.find()
    .then(reservations => {
      //If no reservations are present, throw a 404 error
      if (reservations == null) {
        return res.status(404).json({
          message: "No reservations found"
        })
      }
      res.json(reservations)
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        message: "Problem getting houses"
      })
    })
})

// GET- get all reservations for one specific property---------------------------
router.get('/:id', Utils.authenticateToken, async (req, res) => {
  const propertyID = req.params.id
  try {
    // Fetch reservations for the given property ID
    const reservations = await Reservation.find({ propertyID });
    //If no reservations are present, throw an error
    if (reservations.length === 0) {
      return res.json({ message: "No reservations found" });
    }

    const plainReservations = reservations.map(reservation => reservation.toObject());
    res.json(plainReservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Problem getting reservations" });
  }

})

// GET- get all reservations done by the logged in customer---------------------------
router.get('/customer/:id', Utils.authenticateToken, async (req, res) => {
  //Retrieve the id from the params
  const customerID = req.params.id
  console.log("customerID")
  try {
    // Fetch reservations for the given property ID
    const reservations = await Reservation.find({ customerID });
    //If no reservations are present, return an error
    if (reservations.length === 0) {
      return res.json({ message: "No reservations found" });
    }

    const plainReservations = reservations.map(reservation => reservation.toObject());
    res.json(plainReservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Problem getting reservations" });
  }

})


// POST - create new reservation --------------------------------------
router.post('/', async (req, res) => {
  try {
    // Validate request body
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({ message: "Reservation content cannot be empty" });
    }
    const { propertyID, startDate, endDate } = req.body;

    // Validate required fields
    if (!propertyID || !startDate || !endDate) {
      return res.status(400).send({ message: "Missing required fields" });
    }

    // Convert startDate and endDate to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ensure startDate is not in the past
    if (start < today) {
      return res.status(400).send({ message: "Start date cannot be in the past" });
    }
    //Ensure start is not after the end date
    if (start >= end) {
      return res.status(400).send({ message: "End date must be after start date" });
    }

    // Check for overlapping reservations
    const overlappingReservations = await Reservation.find({
      propertyID,
      $and: [
        // The new booking starts before or on the same day an existing booking ends
        { startDate: { $lte: end } }, 
        // The new booking ends after or on the same day an existing booking starts
        { endDate: { $gte: start } }, 
      ],
    });

    if (overlappingReservations.length > 0) {
      return res.status(409).send({ message: "Reservation conflicts with an existing booking" });
    }

    // Create a new reservation
    const newReservation = new Reservation(req.body);

    // Save the reservation
    const savedReservation = await newReservation.save();

    // Respond with the created reservation
    res.status(201).json(savedReservation);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Problem creating reservation", error: err });
  }
});

// Export the router
module.exports = router;



// export
module.exports = router


