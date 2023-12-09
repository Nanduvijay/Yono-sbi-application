
const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');

const app = express();
const PORT = 3000; // You can use any available port

// Configure Oracle Database connection (replace 'your_connection_string' with your actual connection string)
const dbConfig = {
    user: 'nishanth',
    password: 'password1',
    connectString: 'localhost:1521/xe'
};
oracledb.initOracleClient({ libDir: '' });

// Middleware to parse the request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Route for serving the HTML file
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/customer.html');
});

// Handle form submission
app.post('/register', async (req, res) => {
    // Extract product data from the request body
    const customerdata = {
        customer_name: req.body['cname'],
        customer_email: req.body['email'],
        customer_mobile_number: req.body['mnumber'],
        customer_address: req.body['address'],
        customer_date_of_birth: req.body['dob'],
        customer_pan_number: req.body['pno'],
        customer_aadhaar_number :req.body['aadhar']
    };
    console.log('Customer Data:', customerdata);
    // Connect to the Oracle Database
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Insert product data into the database
        const result = await connection.execute(
            `INSERT INTO customer ( CUSTOMER_NAME, CUSTOMER_EMAIL, CUSTOMER_MOBILE_NUMBER, CUSTOMER_ADDRESS, CUSTOMER_DATE_OF_BIRTH, CUSTOMER_PAN_NUMBER, customer_aadhaar_number ) VALUES (:customer_name, :customer_email, :customer_mobile_number, :customer_address, :customer_date_of_birth, :customer_pan_number, :customer_aadhaar_number )`,
            customerdata
        );
        
        // Commit the transaction
        await connection.commit();

        console.log(result);

        res.send('customer registered successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error registering customer');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});