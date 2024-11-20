
const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const House = require('./../models/House')
const path = require('path')
const fs = require('fs')
const multer = require('multer');


// GET - get all houses with their first image ---------------------------
router.get('/', Utils.authenticateToken, async (req, res) => {
  try {
    // Fetch all houses from the database
    const houses = await House.find();

    // Map over each house and add the first image if it exists
    const housesWithImages = await Promise.all(houses.map(async (house) => {
      const houseId = house._id.toString();
      const imagesDir = path.join(__dirname, '..', 'public', 'images', houseId);
      let firstImageUrl = null;

      //Filtering through the files to search the first image
      if (fs.existsSync(imagesDir)) {
        const imageFiles = fs.readdirSync(imagesDir).filter(file => 
          /\.(jpg|jpeg|png|gif|webp)$/i.test(file) 
        );

        // If at least one image is found, use the first one
        if (imageFiles.length > 0) {
          firstImageUrl = `${req.protocol}://${req.get('host')}/images/${houseId}/${imageFiles[0]}`;
        }
      }

      // Return the house object with the attached first image URL
      return {
        ...house.toObject(), // Convert Mongoose document to plain object
        image: firstImageUrl
      };
    }));

    // Send the resulting houses with images
    res.json(housesWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Problem getting house list", error: err.message });
  }
});




// GET - get a single house by ID ---------------------------
router.get('/property/:id', Utils.authenticateToken, async (req, res) => {
  const houseId = req.params.id;
  //Try catch to try and retrieve the house with the given ID
  try {
    const house = await House.findById(houseId);
    //If no house has that ID it will throw an error
    if (!house) {
      return res.status(404).json({ message: "House not found" });
    }

    // Define the path to the images folder for this house
    const imagesDir = path.join(__dirname, '..', 'public', 'images', houseId);

    // Check if the folder exists and list image files
    let imageUrls = [];
    if (fs.existsSync(imagesDir)) {
      const imageFiles = fs.readdirSync(imagesDir);
      imageUrls = imageFiles.map(file => `${req.protocol}://${req.get('host')}/images/${houseId}/${file}`);
    }

    // Attach image URLs to the house object
    const houseWithImages = {
      ...house.toObject(), // Ensure it's a plain JS object
      images: imageUrls
    };
    //Return the object in the response
    res.json(houseWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Problem getting house details" });
  }
});


// POST - create new property --------------------------------------
router.post('/', async (req, res) => {
  try {
    // validate the object
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({ message: "Form content can't be empty" })
    }
    //Making freeWifi a boolean to match database
    const freeWifi = req.body.freeWifi === 'true'
    // create new haircut
    let newProperty = new House({
      name: req.body.name,
      address: req.body.address,
      description: req.body.description,
      price: req.body.price,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      garageSpots: req.body.garageSpots,
      freeWifi: freeWifi
    })

    //Saving to the database
    const property = await newProperty.save()


    // If an image is provided, upload it
    if (req.files && req.files.image) {
      // Create the upload path using the generated house ID
      let uploadPath = path.join(__dirname, '..', 'public', 'images', property._id.toString());
      // Upload the file
      Utils.uploadFile(req.files.image, uploadPath);
    }

    // Respond with the created property
    return res.status(201).json(property);
  } catch (err) {
    console.error('Error creating property:', err);
    return res.status(500).send({
      message: "Problem creating property",
      error: err
    });
  }
})


// PUT - update property by ID and handle image uploads
router.put('/property/:id', Utils.authenticateToken, async (req, res) => {
  const houseId = req.params.id;
  //Upload a file is there is one
  if (req.files && req.files.image) {
    let uploadPath = path.join(__dirname, '..', 'public', 'images', houseId)
    Utils.uploadFile(req.files.image, uploadPath)
  }
  //Delete an image if there is one to delete
  if (req.body.imageToDelete) {
    Utils.deleteFile(req.body.imageToDelete)
  }

  //Try-catch to try and update the property in the database
  try {
    // Update property details
    const updatedProperty = await House.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    //Return the updated property
    res.json(updatedProperty);
  } catch (err) {

    console.error(err);
    res.status(500).json({ message: 'Problem updating property', error: err });
  }
});

// export
module.exports = router


