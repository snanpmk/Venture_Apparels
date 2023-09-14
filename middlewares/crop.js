const sharp = require('sharp')

const cropImage = (req, res, next) => {
    const uploadedImagePath = req.file.path;
    const croppedImagePath = `${uploadedImagePath.split(".")[0]}_cropped.jpg`;
  
    // Dimensions for the desired aspect ratio
    const targetWidth = 750;
    const targetHeight = 1000;
  
    sharp(uploadedImagePath)
      .resize({
        width: targetWidth,
        height: targetHeight,
        // fit: 'contain', // Maintain aspect ratio and fit within the specified dimensions
        background: { r: 255, g: 255, b: 255, alpha: 1 } // White background
      })
      .toFile(croppedImagePath, err => {
        if (err) {
          return res.status(500).json({ error: "Error cropping image." });
        }
        req.croppedImagePath = croppedImagePath.replace("uploads", "");
        next();
      });
  };

  
  module.exports = cropImage
  