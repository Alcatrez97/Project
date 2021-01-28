var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var passPortLocalMongoose = require('passport-local-mongoose');

const msgSchema = new Schema({
    Sender: {
        type: String,
        required: true
    },
    data_type: {
        type: String,
        default: 'text'
    },
    data_text: { 
        type: String,
        required: true
    }
    
}, {
    timestamps: true
});

const conversationSchema = new Schema({
    contactId: String,
    messages: [msgSchema],
    new_msg:{
        type: Number,
        default: -1
    }
})

var User = new Schema({
    username: { 
        type: String,
        default: "Hello Guest"
    },
    userType: {
        type: String,
        default: "P",
        required: true
    },
    firstname: String,
    lastname: String,
    email: String,
    contacts: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
    ,
    conversations: [conversationSchema],
   
    
    facebookId: String,
    googleId: String
        
});

User.plugin(passPortLocalMongoose);

module.exports = mongoose.model('User',User);
