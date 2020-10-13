const express = require('express'),
      passport = require('passport')
const router = express.Router()
const User = require('../models/User')

router.post('/register', async (req, res) => {
    const { name, email, password, password2 } = req.body
    const isDuplicate = await User.find({ email: email })
    
    if(isDuplicate.length > 0) return res.send({msg: 'Error: Email is already registered'})
    else if(password.length < 6) return res.send({msg: 'Password should at least have 6 characters'})
    else if(password !== password2) return res.send({msg: 'Passwords must match'})
    else {
        const newUser = new User({
            name,
            email,
            password
        })
        newUser.save()
        .then(() => res.send({ success: 'You have registered successfully' }))
        .catch(err => res.send({msg: err}))
    }
})

router.post('/login', passport.authenticate('local'), (req, res) => {
    const username = req.user.name
    res.send({ success: `User ${username} has signed in.` })
})

// router.post('/login', (req, res, next) => {
//     passport.authenticate('local', {
//       successRedirect: '/',
//       failureRedirect: '/login',
//       failureFlash: true
//     })(req, res, next)
// })



router.get("/logout", function(req, res) {
  req.session.destroy(() => {
   req.logout();
   res.redirect("/login");
  });
 });

// router.post('/login', (req, res) => passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', })(req, res))
module.exports = router
