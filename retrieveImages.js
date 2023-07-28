const admin = require('firebase-admin');
const serviceAccount = require('./stocks_credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'stocks-444ce.appspot.com', // Replace with your Firebase Storage bucket URL
});

const bucket = admin.storage().bucket();

async function listImagesInStorage() {
  try {
    const [files] = await bucket.getFiles({ prefix: 'images/' });
    console.log('Files in the "images" folder:');
    files.forEach((file) => {
      console.log(file.name);
    });
  } catch (error) {
    console.error('Error listing files in the "images" folder:', error);
  }
}

async function retrieveImageUrlForSymbol(symbol) {
  try {
    // Remove the '.png' extension from the symbol to match the image file name
    const imageName = symbol.replace('.png', '');
    const imagePath = `images/${imageName}.png`;

    // Get the image download URL
    const [url] = await bucket.file(imagePath).getSignedUrl({
      action: 'read',
      expires: '01-01-2500', // Set the expiration date accordingly
    });

    return url;
  } catch (error) {
    console.error('Error retrieving image URL from Firebase Storage:', error);
    return null;
  }
}

async function retrieveImageUrlsForSymbols(symbols) {
  try {
    const imageUrls = [];
    for (const symbol of symbols) {
      const imageUrl = await retrieveImageUrlForSymbol(symbol);
      if (imageUrl) {
        imageUrls.push(imageUrl);
      }
    }
    return imageUrls;
  } catch (error) {
    console.error('Error retrieving image URLs:', error);
    return [];
  }
}

async function main() {
  // List images in the "images" folder in Firebase Storage
  await listImagesInStorage();

  // Retrieve image URLs for multiple symbols
  const symbolsToRetrieve = ['1_ADANIPORTS.png', '3_ADANIENT.png'];
  const imageUrls = await retrieveImageUrlsForSymbols(symbolsToRetrieve);
  console.log('Image URLs:', imageUrls);
}

main().catch((error) => {
  console.error('Error:', error);
});
