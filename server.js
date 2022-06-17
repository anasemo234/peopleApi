//  Dependencies
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const admin = require('firebase-admin');
// Initialize the Express App
const app = express();

// Configure App Settings
require('dotenv').config();


admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-service-key.json'))
});

const { PORT = 4000, MONGODB_URL } = process.env;


// Connect to mongoDB
mongoose.connect(MONGODB_URL);

// Mongo Status Listeners
mongoose.connection
.on('connected', () => console.log('Connected to MongoDB'))
.on('error', (error) => console.log('Error with MongoDB: ' + err.message))




// Set up our model
const peopleSchema = new mongoose.Schema({
    name: String,
    image: String,
    title: String,
    googleId: String
}, { timestamps: true });


const People = mongoose.model('People', peopleSchema);





// Mount Middleware
app.use(cors());     // Access-Control-Allow: '*'
app.use(morgan('dev'));
app.use(express.json());
// this creates req.body from incoming JSON request bodies                
// app.use(express.urlencoded({ extended: fasle }))  
// ^~~~ this also creates req.bdoy but only when express is serving HTML 

// Authorization middleaware
app.use(async (req, res, next) => {
    const token = req.get('Authorization');
    if(token) {
            try {
                  const user =  await admin.auth().verifyIdToken(token.replace('Bearer ', ""));
            req.user = user;
            } catch (error) {
                req.user = null;
            }
          
    } else {
        req.user = null;
    }
    next();
});

function isAuthenticated(req, res ,next) {
    if(!req.user) {
     return res.status(401).json({message: "you must be logged in"});
    } else {
        return next();
    }
}




// Mount Routes
app.get("/", (req, res) => {
    res.send("Hello and Welcome to the people app")
});

// Index
app.get('/people', isAuthenticated, async (req, res) => {
    try {
        const googleId = req.user.uid;
        res.json( await People.find({ googleId }));
    } catch (error) {
        console.log('error: ', error);
        res.json({error: 'something went wrong - check console'});
    }
});
// Create
app.post('/people', isAuthenticated, async (req, res) => {
    try {
        req.body.googleId = req.user.uid;
        res.json(await People.create(req.body)); 
    } catch (error) {
        console.log('error: ', error);
        res.json({error: 'something went wrong'})
    }
});
// Update
app.put('/people/:id', isAuthenticated, async (req, res) => {
    try {
        res.json(await People.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }))
    } catch (error) {
        console.log('error: ', error);
        res.json({error: 'something went wrong'})
    }
});

// Delete
app.delete('/people/:id', isAuthenticated, async (req, res) => {
    try {
        res.json(await People.findByIdAndDelete(req.params.id));
    } catch (error) {
        console.log('error: ', error);
        res.json({error: 'something went wrong'})
    }
})





// Tell Express to Listen
app.listen(PORT, () => {
    console.log(`Express listening on port:${PORT}`);
});