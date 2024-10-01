const express = require('express');
const { S3Client, PutObjectCommand,ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const bodyParser = require('body-parser');
const stream = require('stream');
const csv = require('csv-parser'); // CSV parser for handling CSV files
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

app.post('/upload/data', async (req, res) => {
    const bucketName = 'cheesebucketlehighu';
    const data_dir = 'cake_task_data/';
    const fileName = data_dir + `${req.body.userID}.csv`; // Generate a unique file name

    try {
        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: req.body.csvString,
            ContentType: 'text/csv', // Change this if your video is in a different format
        };

        const data = await s3.send(new PutObjectCommand(params));
        res.json({ message: 'Data uploaded successfully', data });
    } catch (err) {
        console.error('Error uploading video:', err);
        res.status(500).json({ error: 'Error uploading video', details: err });
    }
});


app.get('/s3/get-object/bucket/:bucket/key/:key', async (req, res) => {
    console.log("req.query", req.query);
    console.log("req.params", req.params);

    const input = {
        Bucket: req.params.bucket,
        Key: req.params.key,
    };

    const command = new GetObjectCommand(input);

    try {
        const response = await s3.send(command);

        // Get the stream from the response
        const responseStream = response.Body;

        // Check if the response is a readable stream
        if (responseStream instanceof stream.Readable) {
            let csvData = [];

            // Parse CSV data from the stream
            responseStream
                .pipe(csv())
                .on('data', (row) => {
                    console.log(row);
                    csvData.push(row); // Each row is an object where keys are the CSV column headers
                })
                .on('end', () => {
                    console.log(csvData)
                    res.json(csvData); // Send the parsed CSV data as JSON response
                })
                .on('error', (parseError) => {
                    console.error('Error parsing CSV:', parseError);
                    res.status(500).json({ error: 'Failed to parse CSV', details: parseError.message });
                });

        } else {
            throw new Error('Failed to retrieve the S3 object stream');
        }
    } catch (error) {
        console.error('Error retrieving object from S3:', error);
        res.status(500).json({ error: 'Failed to retrieve object from S3', details: error.message });
    }
});

app.get('/s3/list-objects', async (req, res) => {
    const input = {
      Bucket: 'cheesebucketlehighu',  // Replace with your actual bucket name
      MaxKeys: 100,               // Limit the number of objects returned
    };
  
    const command = new ListObjectsCommand(input);
  
    try {
      const response = await s3.send(command);
      res.json({
        message: 'Objects retrieved successfully',
        data: response.Contents,
      });
    } catch (error) {
      console.error('Error listing objects from S3:', error);
      res.status(500).json({ error: 'Failed to list objects from S3', details: error.message });
    }
});

app.get('/test', (req, res) => res.send('Server is running'));


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});