const express = require('express');
const { S3Client, PutObjectCommand,ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const bodyParser = require('body-parser');
// const stream = require('stream');
//const cors = require('cors');


const app = express();
const port = process.env.PORT || 3000;

const s3 = new S3Client({
    region: 'us-east-2' // Specify your region
});

app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '256gb' }));


// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});