//  Dependencies
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
// Initialize the Express App
const app = express();

// Configure App Settings
require('dotenv').config();
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
    title: String
}, { timestamps: true });


const People = mongoose.model('People', peopleSchema);





// Mount Middleware
app.use(cors());     // Access-Control-Allow: '*'
app.use(morgan('dev'));
app.use(express.json());
// this creates req.body from incoming JSON request bodies                
// app.use(express.urlencoded({ extended: fasle }))  
// ^~~~ this also creates req.bdoy but only when express is serving HTML 




// Mount Routes
app.get("/", (req, res) => {
    res.send("Hello and Welcome to the people app")
});

// Index
app.get('/people', async (req, res) => {
    try {
        res.json( await People.find({}));
    } catch (error) {
        console.log('error: ', error);
        res.json({error: 'something went wrong - check console'});
    }
});
// Create
app.post('/people', async (req, res) => {
    try {
        res.json(await People.create(req.body)); 
    } catch (error) {
        console.log('error: ', error);
        res.json({error: 'something went wrong'})
    }
});
// Update
app.put('/people/:id', async (req, res) => {
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
app.delete('/people/:id', async (req, res) => {
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