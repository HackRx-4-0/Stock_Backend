const admin = require('firebase-admin');
const serviceAccount = require('./stocks_credentials.json');
const { performance } = require('perf_hooks');
const fs = require('fs');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'stocks-444ce.appspot.com', // Replace with your storage bucket URL
});

const bucket = admin.storage().bucket();

// Function to handle image upload
function uploadImage(imagePath, imageName) {
  const remoteFilePath = 'images/' + imageName; // Specify the path in the bucket where you want to store the image

  return new Promise((resolve, reject) => {
    // Start the timer
    const startTime = performance.now();

    // Upload the image file to Firebase Storage
    bucket
      .upload(imagePath, {
        destination: remoteFilePath,
        metadata: {
          contentType: 'image/jpeg', // Replace with the appropriate content type
          // You can add more metadata fields as needed
        },
      })
      .then(() => {
        // End the timer
        const endTime = performance.now();
        const uploadTime = (endTime - startTime) / 1000; // Convert to seconds

        console.log(`Image '${imageName}' uploaded successfully!`);
        console.log(`Time taken to upload: ${uploadTime.toFixed(2)} seconds`);

        // Get the public URL of the uploaded image
        const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          remoteFilePath
        )}?alt=media`;

        // You can save this downloadURL in Firestore or use it as needed
        console.log('Image download URL:', downloadURL);

        resolve(downloadURL);
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
        reject(error);
      });
  });
}

async function uploadAllImages() {
  try {
    const imagesToUpload = [
      {
        folder: './charts/one/',
        prefix: '1_',
      },
      {
        folder: './charts/three/',
        prefix: '3_',
      },
      // Add more folders as needed...
    ];

    const uploadPromises = [];

    for (const folderInfo of imagesToUpload) {
      const folderPath = folderInfo.folder;
      const fileNames = fs.readdirSync(folderPath);
      for (const fileName of fileNames) {
        const imagePath = folderPath + fileName;
        const imageName = folderInfo.prefix + fileName;
        uploadPromises.push(uploadImage(imagePath, imageName));
      }
    }

    const uploadedUrls = await Promise.all(uploadPromises);
    console.log('All images uploaded successfully!');
    console.log('Uploaded URLs:', uploadedUrls);
  } catch (error) {
    console.error('Error uploading images:', error);
  }
}

uploadAllImages();
