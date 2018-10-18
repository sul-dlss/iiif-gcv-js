// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');
const manifesto = require('manifesto.js');

// Creates a client
const client = new vision.ImageAnnotatorClient();

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

  const foo = manifestation.getSequences()[0].getCanvases()[0].getCanonicalImageUri(1000);
  console.log(foo);
  await client
    .labelDetection(foo)
    .then(results => {
      console.log(results);
      const labels = results[0].labelAnnotations;

      res.send(labels.map(label => label.description));
    })
    .catch(err => {
      console.log(err)
      console.error('ERROR:', err);
    });
}
