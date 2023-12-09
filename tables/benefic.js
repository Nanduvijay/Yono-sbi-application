const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const app = express();
const port = 2500;

// Oracle DB Thin Driver Configuration
oracledb.initOracleClient({ libDir: '' });

// Oracle DB Configuration
const dbConfig = {
    user: 'nishanth',
    password: 'password1',
    connectString: 'localhost:1521/xe'
};

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // For parsing application/json

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/beneficiary.html');
});

app.post('/submit-beneficiary', async (req, res) => {
    const { customerId, accountNumber, beneficiaryName, bankName, ifscCode } = req.body;
    try {
        await insertBeneficiaryIntoDatabase(customerId, accountNumber, beneficiaryName, bankName, ifscCode);
        res.send('Beneficiary inserted successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred while inserting beneficiary');
    }
});

app.get('/fetch-beneficiaries', async (req, res) => {
    try {
        const beneficiaries = await fetchBeneficiariesFromDatabase();
        res.json(beneficiaries);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred while fetching beneficiaries');
    }
});

app.put('/update-beneficiary', async (req, res) => {
    try {
        const { beneficiaryId, beneficiaryName } = req.body;
        await updateBeneficiaryInDatabase(beneficiaryId, beneficiaryName);
        res.send('Beneficiary updated successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred while updating beneficiary');
    }
});

app.delete('/delete-beneficiary', async (req, res) => {
    try {
        const { beneficiaryId } = req.body;
        await deleteBeneficiaryFromDatabase(beneficiaryId);
        res.send('Beneficiary deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error occurred while deleting beneficiary');
    }
});

async function insertBeneficiaryIntoDatabase(customerId, accountNumber, beneficiaryName, bankName, ifscCode) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const sql = `INSERT INTO Beneficiary_master (customer_id, account_number, beneficiary_name, bank_name, ifsc_code) 
                     VALUES (:customerId, :accountNumber, :beneficiaryName, :bankName, :ifscCode)`;
        const result = await connection.execute(sql, [customerId, accountNumber, beneficiaryName, bankName, ifscCode], { autoCommit: true });
        console.log("Row inserted:", result.rowsAffected);
    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function fetchBeneficiariesFromDatabase() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const sql = 'SELECT beneficiary_id, customer_id, account_number, beneficiary_name, bank_name, ifsc_code FROM Beneficiary_master ORDER BY beneficiary_id';
        const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        return result.rows.map(row => ({
            BENEFICIARY_ID: row.BENEFICIARY_ID,
            CUSTOMER_ID: row.CUSTOMER_ID,
            ACCOUNT_NUMBER: row.ACCOUNT_NUMBER,
            BENEFICIARY_NAME: row.BENEFICIARY_NAME,
            BANK_NAME: row.BANK_NAME,
            IFSC_CODE: row.IFSC_CODE
        }));
    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function updateBeneficiaryInDatabase(beneficiaryId, beneficiaryName) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const sql = 'UPDATE Beneficiary_master SET beneficiary_name = :beneficiaryName WHERE beneficiary_id = :beneficiaryId';
        const result = await connection.execute(sql, { beneficiaryName, beneficiaryId }, { autoCommit: true });
        console.log("Row updated:", result.rowsAffected);
    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

async function deleteBeneficiaryFromDatabase(beneficiaryId) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const sql = 'DELETE FROM Beneficiary_master WHERE beneficiary_id = :beneficiaryId';
        const result = await connection.execute(sql, { beneficiaryId }, { autoCommit: true });
        console.log("Row deleted:", result.rowsAffected);
    } catch (err) {
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
