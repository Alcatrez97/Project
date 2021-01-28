const express = require('express')
const mongoose =require('mongoose');
const test = require('./routes/testRoute');
const User = require('./models/users');
const users = require('./models/users');
var passport = require('passport');
const userRouter = require('./routes/userRouter');
const msgRouter = require('./routes/msgRouter');
const { NotExtended } = require('http-errors');
const config = require('./config');
const app = express()


//set the template engine ejs
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(express.json());

//middlewares
app.use(express.static('public')) 

//db connection
const connect = mongoose.connect("mongodb+srv://root:toor@alca1.9aycb.mongodb.net/<dbname>?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, dbName: 'chatApp'});
connect.then(() => {
    console.log("Connected to DATABASE");
    users.create()
    .then(()=>{
        console.log('Empty User created')
    })
    .catch((err) => next(err))


})
.catch((err) => console.log('Cannot conndect to DB '+err))


//routes
app.get('/', (req, res) => {
	res.render('facebook.ejs')
});
app.use('/users',userRouter);
app.use('/m',msgRouter); 


//Listen on port 3000 
server = app.listen(4000)



//socket.io instantiation
const io = require("socket.io")(server)


//listen on every connection
io.on('connection', (socket) => {
	console.log('New user connected')

	//default username
	socket.username = "Anonymous"

    //listen on change_username
    socket.on('change_username', (data) => {
        socket.username = data.username
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        io.sockets.emit('new_message', {message : data.message, username : socket.username});
    })

    //listen on typing
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
    })
})
