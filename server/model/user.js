const mongoose = require('mongoose');

var User = mongoose.model('User', {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,   
        required: true,
        minlength: 1,
        trim: true
    }
});

module.exports = {User};