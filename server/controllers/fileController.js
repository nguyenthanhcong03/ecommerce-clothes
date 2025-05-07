const {
  uploadSingleFile,
  uploadMultipleFiles,
  formatImagesForDB,
  deleteFile,
  deleteMultipleFiles,
} = require("../services/fileService");

/**
 * Upload một file đơn lẻ lên Cloudinary
 * @route POST /api/file/upload
 * @access Public/Private (tùy thuộc vào middleware)
 */
const uploadFile = async (req, res) => {
  try {
    // Kiểm tra nếu có file đã được upload
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: "Không có file nào được tải lên",
      });
    }

    // Lấy tham số thư mục hoặc sử dụng giá trị mặc định
    const folder = req.query.folder || "uploads";

    // Upload lên Cloudinary
    const result = await uploadSingleFile(req.files.file, folder);

    // Trả về phản hồi thành công
    res.status(200).json({
      success: true,
      message: "Tải lên file thành công",
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resource_type: result.resource_type,
      },
    });
  } catch (error) {
    console.error("Lỗi tải lên file:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải lên file",
      error: error.message,
    });
  }
};

/**
 * Upload nhiều files lên Cloudinary
 * @route POST /api/file/upload/multiple
 * @access Public/Private (tùy thuộc vào middleware)
 */
const uploadMultipleFilesHandler = async (req, res) => {
  try {
    // Kiểm tra nếu có files đã được upload
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có files nào được tải lên",
      });
    }

    // Lấy tham số thư mục hoặc sử dụng giá trị mặc định
    const folder = req.query.folder || "uploads";

    // Upload lên Cloudinary
    const results = await uploadMultipleFiles(req.files, folder);

    // Định dạng cho cơ sở dữ liệu nếu cần
    const formattedResults = formatImagesForDB(results);

    // Trả về phản hồi thành công
    res.status(200).json({
      success: true,
      message: `${results.length} files đã được tải lên thành công`,
      data: formattedResults,
      rawResults: results, // Bao gồm kết quả gốc để gỡ lỗi hoặc sử dụng khác
    });
  } catch (error) {
    console.error("DEBUG: Lỗi tải lên nhiều files:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tải lên files",
      error: error.message,
    });
  }
};

/**
 * Xóa một file từ Cloudinary
 * @route DELETE /api/file/delete
 * @access Public/Private (tùy thuộc vào middleware)
 */
const deleteFileHandler = async (req, res) => {
  try {
    const { publicId, url } = req.body;

    if (!publicId && !url) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp publicId hoặc URL để xóa file",
      });
    }

    // Xóa file từ Cloudinary
    const result = await deleteFile(publicId || url);

    // Trả về phản hồi thành công
    res.status(200).json({
      success: true,
      message: "File đã được xóa thành công",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi khi xóa file:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa file",
      error: error.message,
    });
  }
};

/**
 * Xóa nhiều files từ Cloudinary
 * @route DELETE /api/file/delete/multiple
 * @access Public/Private (tùy thuộc vào middleware)
 */
const deleteMultipleFilesHandler = async (req, res) => {
  try {
    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp mảng files (publicIds hoặc URLs) để xóa",
      });
    }

    // Xóa nhiều files từ Cloudinary
    const results = await deleteMultipleFiles(files);

    // Trả về phản hồi thành công
    res.status(200).json({
      success: true,
      message: `${results.length} files đã được xóa thành công`,
      data: results,
    });
  } catch (error) {
    console.error("Lỗi khi xóa nhiều files:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa files",
      error: error.message,
    });
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFilesHandler,
  deleteFileHandler,
  deleteMultipleFilesHandler,
};
