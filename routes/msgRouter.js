const express = require('express');
const bodyparser = require('body-parser');
const authenticate = require('../authenticate');
const Users = require('../models/users');
const pasport = require('passport');
const userRouter = require('./userRouter');
const message = require('../models/message');
const conversation = require('../models/conversation')
const f = require('session-file-store');
const { NotExtended } = require('http-errors');

const msgRouter = express.Router();
msgRouter.use(bodyparser.json());

msgRouter.options('*', (req, res) => {
    res.sendStatus(200);
});

//get all conversation of the current user
msgRouter.get('/getallconversation', authenticate.verifyUser, (req, res, next) => {
    const userId = req.user;
    console.log(req)
    console.log(userId)
    Users.findById(userId)
        .then((user) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            console.log(user+' this is user obj'); 
            res.json(user.conversations);
            res.end('END')
        }, (err) => next(err))
        .catch((err) => next(err))
});

//get a specific msg from give contactId's converstation 
msgRouter.get('/msg', authenticate.verifyUser, (req, res, next) =>{
    const contactId = req.body.contactId;
    const userId = req.user._Id;
    Users.findById(userId)
        .then((user) => {
            for (let index = 0; index < user.conversations.length; index++) {
                const element = user.conversations[index].contactId;
                if(element === contactId){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user.conversations[index]);
                }
            }
        }, (err) => next(err))
        .catch((err) => next(err));
});

//update undelivered msg for a given conversation
msgRouter.get('/updateNewMsg', authenticate.verifyUser, (req, res, next) => {
    const contactId = req.body.Sender;
    const conv = req.body.conv;
    Users.findById(contactId)
        .then((user) =>{
           var i = user.conversations[conv].new_msg;
           var msgArr = [];
           for (; i < user.conversations.length; i++) {
               msgArr.push(user.conversations[i]);   
           }
           res.setHeader('Content-Type', 'application/json');
           res.json(msgArr);
        
        })

})

//send msge from current logged in user to the given user
msgRouter.post('/sendmsg', authenticate.verifyUser, (req, res, next) => {
    const senderId = req.user._id;
    const receverId = req.body.Sender;
    Users.findById(senderId)
        .then((user) => {
            if(user.userType == "P"){
                req.end("You are not allowed to edit this req")
            }
        })
    console.log(receverId+'<<<<<<<<< receverId')
    console.log(senderId+'<<<<<<<<<< SendeID')
   // console.log('user: '+ req.user);

   //crypt data encryp && RSA key Blockchain ==>

//    OpenId or OAuth
   //encrypted data ==>
    message.create({'Sender': senderId, 'data_text': req.body.data_text})
        .then((msg) => {
            console.log('Msg created', msg)
            Users.findById(senderId)
                .then((user) => {
                    console.log(user.username+' sender');
                    var found = false;
                    if(user !==null && user.conversations !== null && user !== null){
                    for (let index = 0; index < user.conversations.length; index++) {
                        const element = user.conversations[index].contactId;
                        if (element === receverId) {
                           user.conversations[index].messages.push(msg);
                           user.save();
                           found = true;
                            console.log('conv found on sender side');
                        }
                    }
                    } 
                    if(!found){
                        conversation.create({ 'contactId': receverId, 'messages': [msg]})
                            .then((Conversation) => {
                                user.conversations.push(Conversation);
                                console.log('conv created on sender side');
                                user.save();
                              
                            })
                    }
                }, (err) => next(err))
                .catch((err) => next(err));

                Users.findById(receverId)
                    .then((user) => {
                        console.log(user.username+' reciever')
                        
                        var fund = false;
                        if (user !== null && user.conversations !== null && user !== null) {
                            for (let index = 0; index < user.conversations.length; index++) {
                                const element = user.conversations[index].contactId;
                                // console.log(element);
                                // console.log(element + 'conv id');
                                // console.log(senderId + ' sender id')
                                if (element == senderId) {
                                //    console.log('found>>>>>>>>>>>>>>');
                                    user.conversations[index].messages.push(msg);
                                    if(user.conversations.new_msg>=index)
                                        user.conversations.new_msg = index;
                                    user.save();
                                    fund = true;
                                    console.log('conversation found on reciever side');
                                    //   res.json(user);
                                    // res.json(user)
                                    // //console.log(res.json(user));
                                    // res.end('Done');
                                }
                            }
                        }
                        if (!fund) {
                            conversation.create({ 'contactId': senderId, 'messages': [msg] , 'new_msg': 0})
                                .then((Conversation) => {
                                // console.log('new conversation created : ' + Conversation);
                                    user.conversations.push(Conversation);
                                    user.save();
                                    console.log('conv created on reciever side')
    //console.log('user conv : ' + user.conversations);
                                    // res.json(user);
                                    // res.end();
                                }, (err) => next(err))
                        }
                    }, (err) => next(err))
                    .catch((err) => next(err));

                res.end('Msg sent');
            
        }, (err) => next(err))
    
});

module.exports = msgRouter;