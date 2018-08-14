const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');

// Register / sign up
exports.signup = (req, res, next) => {
  User.find({ email: req.body.email })
  .exec()
  .then(user => {
    console.log(user);
    if (user.length > 0) res.status(409).json({ message: 'Mail exists' });
    else {
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: req.body.password
      });
      user.save()
        .then(result => {
          console.log(result);
          res.status(201).json({ message: 'User created' });
        })
        .catch(error => {
          console.log(error);
          res.status(500).json({ error });
        });
    }
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
};

// Log in
exports.login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        res.status(401).json({ message: 'Email not found' });
      } else {
        if (req.body.password == user[0].password) {
          const token = jwt.sign({ email: user[0].email, id: user[0]._id }, 'secret', { expiresIn: '1h' });
          res.status(200).json({
            message: 'Login successful',
            token: token
          });
        }
        res.status(401).json({ message: 'Incorrect password'});
      }
    });
};