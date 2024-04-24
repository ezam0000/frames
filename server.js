const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = '/tmp/uploads';
    if (!fs.existsSync(tempDir)){
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
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

    const fpsInput = req.body.fps;
    let fps;
    switch (fpsInput) {
        case '4':
            fps = 4;
            break;
        case '16':
            fps = 16;
            break;
        case '24':
            fps = 24;
            break;
        default:
            fps = 8; // Default to 8 if no matching case
    }

    const outputFilename = `processed-${Date.now()}.mp4`;
    const outputPath = path.join(processedDir, outputFilename);

    ffmpeg(file.path)
        .fps(fps)
        .on('end', function() {
            console.log('Video processing finished.');
            fs.unlinkSync(file.path); // Delete the original upload
            res.download(outputPath, outputFilename, (err) => {
                if (err) {
                    console.error('Failed to send processed video: ', err);
                    return;
                }
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
