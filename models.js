const mongoose = require('mongoose');

// Mongoose models

const userSchema = mongoose.Schema({
    username: {type: String},
    password: {type: String}
}, {versionKey: false});
const User = mongoose.model('User', userSchema, 'users');

const entriesSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    belongs: {type: String, required: true},
    createdTime: {type: Number, required: true},
    nextReviewTime: {type: Number, required: true},
    reviewTimesCount: {type: Number, required: true}
}, {versionKey: false});
const Entries = mongoose.model('Entries', entriesSchema, 'entries');

module.exports = {
    User: User,
    Entries: Entries
};
