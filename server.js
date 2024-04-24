const express = require('express');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Ensure that the temporary directories exist on server startup
const tempUploadsDir = '/tmp/uploads';
const tempProcessedDir = '/tmp/processed';
if (!fs.existsSync(tempUploadsDir)) {
    fs.mkdirSync(tempUploadsDir, { recursive: true });
}
if (!fs.existsSync(tempProcessedDir)) {
    fs.mkdirSync(tempProcessedDir, { recursive: true });
}

// Configure storage for multer to use the /tmp directory for uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempUploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle video uploads and processing
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
    const outputPath = path.join(tempProcessedDir, outputFilename);

    ffmpeg(file.path)
        .fps(fps)
        .on('end', function() {
            console.log('Video processing finished.');
            fs.unlinkSync(file.path); // Delete the original upload
            res.download(outputPath, outputFilename, (err) => {
                if (err) {
                    console.error('Failed to send processed video:', err);
                    return res.status(500).send('Error sending processed video.');
                }
                fs.unlinkSync(outputPath); // Delete the processed file after sending
            });
        })
        .on('error', function(err) {
            console.error('Error processing video:', err.message);
            res.status(500).send('Error processing video');
        })
        .save(outputPath);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app; // Export the app for Vercel
