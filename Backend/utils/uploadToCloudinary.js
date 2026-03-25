const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const sharp = require("sharp");

const uploadToCloudinary = async (buffer, folder, resourceType = "auto") => {
  // Compress images before upload (skip for videos)
  let uploadBuffer = buffer;
  if (resourceType === "image") {
    try {
      uploadBuffer = await sharp(buffer)
        .resize({ width: 1080, withoutEnlargement: true }) // max 1080px wide
        .jpeg({ quality: 80, progressive: true })          // compress to JPEG 80%
        .toBuffer();
    } catch (_) {
      // If sharp fails (e.g. unsupported format), use original buffer
      uploadBuffer = buffer;
    }
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(uploadBuffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

module.exports = uploadToCloudinary;
