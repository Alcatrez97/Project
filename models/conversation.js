var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const msgSchema = new Schema({
    Sender: {
        type: String,
        default: ''
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
    new_msg: {
        type: Number,
        default: '-1'
    }
});

module.exports = mongoose.model('conversationSchema', conversationSchema);
