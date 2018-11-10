// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
const Firestore = require('@google-cloud/firestore');
const manifesto = require('manifesto.js');
const crypto = require('crypto');

// Creates a client
const client = new vision.ImageAnnotatorClient();

// Creates a Firestore db
const db = new Firestore();

exports.helloIiif = async(req, res) => {
  // Performs label detection on the image file
  console.log(req);
  console.log(req.body.url)
  let manifestation;
  await manifesto.loadManifest(req.body.url)
    .then((data) => {
      manifestation = manifesto.create(data);
    })
    .catch(err => {
      console.log('ERROR: downloading manifest', req.body.url);
    });
  const width = req.body.width || 1000;

  const foo = manifestation.getSequences()[0].getCanvases()[0].getCanonicalImageUri(width);
  console.log(foo);
  await client
    .annotateImage(
      {
        features: [
          { type: 'TYPE_UNSPECIFIED' },
          { type: 'FACE_DETECTION' },
          { type: 'LANDMARK_DETECTION' },
          { type: 'LOGO_DETECTION' },
          { type: 'LABEL_DETECTION' },
          { type: 'DOCUMENT_TEXT_DETECTION' },
          { type: 'SAFE_SEARCH_DETECTION' },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'CROP_HINTS' },
          { type: 'WEB_DETECTION' }
        ],
        image: { source: { imageUri: foo } }
      }
    )
    .then(results => {
      console.log(results);
      const labels = results[0].labelAnnotations;

      var iiifDoc = db.collection('iiifCloudVisionStuff').doc(
        crypto.createHash('md5').update(req.body.url).digest('hex')
      );

      iiifDoc.set(JSON.parse(JSON.stringify(results))[0]);

      res.send(labels.map(label => label.description));
    })
    .catch(err => {
      console.log(err)
      console.error('ERROR:', err);
    });
}
