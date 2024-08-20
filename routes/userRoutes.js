const express = require('express');
const router = express.Router();
const { createUser, getUserByEmail, getAllUsers, deleteUser,login , getUserById } = require('../models/user');

router.post('/users', (req, res) => {
  const user = req.body;
  console.log('check user', user)
  createUser(user, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(result);
  });
});

router.get('/users', (req, res) => {
  getAllUsers((err, users) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(users);
  });
});

router.get('/users/:email', (req, res) => {
  const { email } = req.params;
  getUserByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  });
});

router.get('/users/id/:id', (req,res) => {
  const {id} = req.params;
  getUserById(id, (err, user) => {
    if (err) {
      return res.status(500).json({error: err.message});
    }
    if(!user){
      return res.status(404).json({message: 'User not found'});
    }
    res.status(200).json(user);
  })
})
router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  deleteUser(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.deletedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send();
  });
});
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('EMAILPASSWORD', email, password)
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password harus diisi.' });
  }

    login(email, password, (err, result) => {
    if (err) {
      
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
    res.json(result);
  });
});
module.exports = router;
