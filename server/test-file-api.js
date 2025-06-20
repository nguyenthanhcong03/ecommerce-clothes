/**
 * File test đơn giản để kiểm tra các API upload và delete file
 * Chạy: node test-file-api.js
 */

const { extractPublicIdFromUrl } = require("./services/fileService");

// Test function để kiểm tra extractPublicIdFromUrl
function testExtractPublicId() {
  console.log("=== Test Extract Public ID ===");

  const testUrls = [
    "https://res.cloudinary.com/demo/image/upload/v1234567890/folder/subfolder/sample.jpg",
    "https://res.cloudinary.com/demo/image/upload/folder/subfolder/sample.jpg",
    "https://res.cloudinary.com/demo/video/upload/v1234567890/videos/sample.mp4",
    "https://res.cloudinary.com/demo/raw/upload/documents/sample.pdf",
    "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg?_a=test",
  ];

  testUrls.forEach((url, index) => {
    try {
      const publicId = extractPublicIdFromUrl(url);
      console.log(`${index + 1}. ✓ URL: ${url}`);
      console.log(`   Public ID: ${publicId}\n`);
    } catch (error) {
      console.log(`${index + 1}. ✗ URL: ${url}`);
      console.log(`   Error: ${error.message}\n`);
    }
  });
}

// Test API endpoints (sử dụng với curl hoặc Postman)
function printApiExamples() {
  console.log("=== Ví dụ API Calls ===\n");

  console.log("1. Upload single file:");
  console.log("POST /api/file/cloud/upload?folder=products");
  console.log("Content-Type: multipart/form-data");
  console.log("Body: file=<your-file>\n");

  console.log("2. Upload multiple files:");
  console.log("POST /api/file/cloud/upload/multiple?folder=products");
  console.log("Content-Type: multipart/form-data");
  console.log("Body: files=<file1>, files=<file2>, ...\n");

  console.log("3. Delete single file:");
  console.log("DELETE /api/file/cloud/delete");
  console.log("Content-Type: application/json");
  console.log("Body: {");
  console.log('  "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/folder/sample.jpg"');
  console.log("}\n");

  console.log("4. Delete multiple files:");
  console.log("DELETE /api/file/cloud/delete/multiple");
  console.log("Content-Type: application/json");
  console.log("Body: {");
  console.log('  "urls": [');
  console.log('    "https://res.cloudinary.com/demo/image/upload/v1234567890/folder/sample1.jpg",');
  console.log('    "https://res.cloudinary.com/demo/image/upload/v1234567890/folder/sample2.jpg"');
  console.log("  ]");
  console.log("}\n");
}

// Chạy tests
if (require.main === module) {
  testExtractPublicId();
  printApiExamples();
}

module.exports = {
  testExtractPublicId,
  printApiExamples,
};
