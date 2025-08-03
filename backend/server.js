const express = require('express');
const bodyParser = require('body-parser');
const sendCode = require('./api/send-code');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/api/send-code', sendCode);

app.get('/', (req, res) => {
    res.send('SGISI backend running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`API corriendo en http://localhost:${PORT}`);
});
