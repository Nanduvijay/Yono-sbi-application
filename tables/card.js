const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// Configure MongoDB connection (replace 'your_connection_string' with your actual connection string)
mongoose.connect('mongodb://localhost:27017/yonosbi', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a schema for card information
const cardSchema = new mongoose.Schema({
    cardId: String,
    customerId: String,
    type: String,
    cardNumber: String,
    cvv: String,
    cardExpiry: String,
    status: String,
});

const Card = mongoose.model('Card', cardSchema);

// Middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route for serving the HTML file
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/card.html');
});

// Handle form submission
app.post('/register-card', async (req, res) => {
    // Extract card data from the request body
    const cardData = {
        cardId: req.body['cardId'],
        customerId: req.body['customerId'],
        type: req.body['type'],
        cardNumber: req.body['cardNumber'],
        cvv: req.body['cvv'],
        cardExpiry: req.body['cardExpiry'],
        status: req.body['status'],
    };

    // Create a new card document
    const newCard = new Card(cardData);

    try {
        // Save the card information to MongoDB
        const savedCard = await newCard.save();
        res.send('Card registered successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering card');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});
