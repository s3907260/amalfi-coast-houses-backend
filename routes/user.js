const express = require('express')
const router = express.Router()
const Utils = require('./../utils')
const User = require('./../models/User')
const path = require('path')


// GET - get single user -------------------------------------------------------
router.get('/:id', Utils.authenticateToken, (req, res) => {
  //Retrieve user with given ID. Error will be returned if no user was retrieved
  User.findById(req.params.id)
    .then(user => {
      res.json(user)
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        message: "Couldn't get user",
        error: err
      })
    })
})


// PUT - update user ---------------------------------------------
router.put('/:id', Utils.authenticateToken, (req, res) => {
  // validate request
  if(!req.body) return res.status(400).send("Task content can't be empty")
  let avatarFilename = null

  // if avatar image exists, upload!
  if(req.files && req.files.avatar){
    // upload avater image then update user
    let uploadPath = path.join(__dirname, '..', 'public', 'images')
    Utils.uploadFile(req.files.avatar, uploadPath, (uniqueFilename) => {
      avatarFilename = uniqueFilename
      // update user with all fields including avatar
      updateUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: avatarFilename,
        bio: req.body.bio    
      })
    })
  }else{
    // update user without avatar
    updateUser(req.body)
  }
  
  // Update the User with the new body
  function updateUser(update){    
    User.findByIdAndUpdate(req.params.id, update, {new: true})
    .then(user => res.json(user))
    .catch(err => {
      res.status(500).json({
        message: 'Problem updating user',
        error: err
      })
    }) 
  }
})


// POST - create new user
router.post('/', async (req, res) => {
  try {
    // Validate request body
    if (Object.keys(req.body).length === 0) {
      return res.status(400).send({ message: "User content cannot be empty" });
    }

    // Check if account with the email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use, use a different email address",
      });
    }

    // If access level is staff, validate the staff password
    if (req.body.accessLevel === "2" && req.body.staffPassword != process.env.STAFF_PASSWORD) {
      console.log(process.env.STAFF_PASSWORD)

        return res.status(403).send({ message: "Invalid staff password" });
      
    } else{
    // Create new user
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      accessLevel: req.body.accessLevel, 
    });
    //Creating the new user and return a success message
    const savedUser = await newUser.save();
    return res.status(201).json(savedUser);
    }


  } catch (err) {
    console.error(err);
    return res.status(500).send({
      message: "Problem creating account",
      error: err.message,
    });
  }
});



module.exports = router