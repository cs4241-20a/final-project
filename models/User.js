const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const Comment = require('./Comment')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
})


  // Middleware allows us to register some functions to run before or after an event occurs
  userSchema.pre('save', async function (next) { 
    // keyword this gives us access to the current user
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
}) 

// on removing the user, also remove their comments
userSchema.pre('remove', async function(next) {
    const user = this
    await Comment.deleteMany({ username: user.name })

    next()
})

const User = mongoose.model('users', userSchema)

module.exports = User