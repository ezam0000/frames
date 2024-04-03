const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Upload video and process
app.post('/upload', upload.single('video'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }

  const fps = req.body.fps === '16' ? 16 : 8; // Default to 8 if not 16
  const outputFilename = `processed-${Date.now()}.mp4`;
  const outputPath = path.join('processed', outputFilename);

  ffmpeg(file.path)
    .fps(fps)
    .on('end', function() {
      console.log('Video processing finished.');
      fs.unlinkSync(file.path); // Delete the original upload
      res.download(outputPath, outputFilename, (err) => {
        if (err) throw err;
        fs.unlinkSync(outputPath); // Delete the processed file after sending
      });
    })
    .on('error', function(err) {
      console.error('Error processing video: ', err.message);
      res.status(500).send('Error processing video');
    })
    .save(outputPath);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
