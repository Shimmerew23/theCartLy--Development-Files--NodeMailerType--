const cloudinary = require('cloudinary').v2;

// Support both CLOUDINARY_URL=cloudinary://key:secret@cloud_name
// and the three individual vars (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - Image buffer (already processed by Sharp)
 * @param {object} options - Cloudinary upload options (folder, public_id, etc.)
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image', ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Verify Cloudinary credentials are valid by pinging the account API.
 * Throws if the credentials are missing or invalid.
 */
const connectCloudinary = async () => {
  const hasUrl = !!process.env.CLOUDINARY_URL;
  const hasVars = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
  if (!hasUrl && !hasVars) {
    throw new Error('Cloudinary credentials are missing — set CLOUDINARY_URL or the three individual vars');
  }
  await cloudinary.api.usage();
};

module.exports = { cloudinary, uploadBuffer, connectCloudinary };
