 // Initialize JsPsych

function isDirectory(path) {
    if (path.split("/").length > 1 && path.split("/")[1].length > 0) {
        return true;
    } else {
        return false;
    }
}

function getDirectory(path) {
    return path.split("/")[0];
}

 function accessPromiseResults(promises) {

    // const leaderboardBody = document.getElementById("leaderboard").getElementsByTagName('tbody')[0];
    // leaderboardBody.innerHTML = '';

    return Promise.allSettled(promises).then(results => {
        // Filter out only the fulfilled promises and extract their values
        return results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value).sort((a, b) => a.responseTime - b.responseTime).forEach((user,index) => {
                //users.sort((a, b) => a.reactionTime - b.reactionTime);33


                // Loop through the top 10 users or available users
                // const topUsers = users.slice(0, 10);
                // topUsers.forEach((user, index) => {
                    // Create a new row
                    console.log("\tUSER: ",user,"PLACE: ",index);
                    // const newRow = leaderboardBody.insertRow();

                    // // Insert cells for place, userID, and reaction time
                    // const cellPlace = newRow.insertCell(0);
                    // const cellUserID = newRow.insertCell(1);
                    // const cellReactionTime = newRow.insertCell(2);

                    // // Set the text content for each cell
                    // cellPlace.textContent = index + 1; // Place
                    // cellUserID.textContent = user.username; // UserID
                    // cellReactionTime.textContent = user.responseTime; // Reaction Time
                //});


            });
    });
  }

  function getObjectFromS3(bucket, key) {
    const url = `/s3/get-object/bucket/${bucket}/key/${encodeURIComponent(key)}`;
    
    return fetch(url)
        .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
        })
        .then(data => {
        console.log('Data received:', data);
        // Handle the received data
        return data;  // Return the data from this promise
        })
        .catch(error => {
        console.error('Error fetching object:', error);
        // Handle the error
        throw error; // Re-throw the error for the caller to handle
    });
  }

    async function uploadData(userID,csvString) {

        const data = {
            userID: userID,
            csvString: csvString
        };

        console.log("uploadData: ",csvString);

        try {
            const response = await fetch('/upload/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseData = await response.json();
            console.log('Data uploaded successfully:', responseData);
        } catch (error) {
            console.error('Error sending data:', error);
        }
    }


async function fetchS3ObjectList() {

    let users = [];

    try {
        const response = await fetch('/s3/list-objects');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Successfully got objects from S3 buckets: ', responseData);
        for (elem in responseData.data) {
            if (isDirectory(responseData.data[elem].Key)) {
                let directory =  getDirectory(responseData.data[elem].Key);
                if (directory == 'cake_task_data') {
                    try {
                        // Clear previous messages and data

                        const bucketName = 'cheesebucketlehighu'; // Replace with your actual bucket name
                        const objectKey = responseData.data[elem].Key;     // Replace with your actual JSON object key

                        users.push(getObjectFromS3(bucketName, objectKey));
                    } catch (error) {
                        console.error('Error fetching JSON object:', error);
                        message.textContent = `Error fetching JSON object: ${error.message}`;
                    }
                }
                
            }
        }
        console.log("USERS.length ",users.length)
        accessPromiseResults(users);
    } catch (error) {
        console.error('Error fetching S3 object list:', error);
    }
}

