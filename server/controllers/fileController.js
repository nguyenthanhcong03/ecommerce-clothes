const {
  uploadSingleFileService,
  uploadMultipleFilesService,
  formatImagesForDB,
  deleteFileService,
  deleteMultipleFilesService,
} = require("../services/fileService");

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
    const result = await uploadSingleFileService(req.files.file, folder);

    console.log("Upload thành công:", result.public_id);

    // Trả về phản hồi thành công với thông tin đầy đủ
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
        folder: folder,
        created_at: result.created_at,
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

const uploadMultipleFiles = async (req, res) => {
  try {
    // Kiểm tra nếu có files đã được upload
    if (!req.files || !req.files.files) {
      return res.status(400).json({
        success: false,
        message: "Không có files nào được tải lên",
      });
    }

    // Lấy tham số thư mục hoặc sử dụng giá trị mặc định
    const folder = req.query.folder || "uploads";

    console.log("Đang upload nhiều files vào folder:", folder);

    // Upload lên Cloudinary
    const results = await uploadMultipleFilesService(req.files, folder);

    // Định dạng cho cơ sở dữ liệu nếu cần
    const formattedResults = formatImagesForDB(results);

    console.log(`Upload thành công ${results.length} files`);

    // Trả về phản hồi thành công với thông tin chi tiết
    res.status(200).json({
      success: true,
      message: `${results.length} files đã được tải lên thành công`,
      data: {
        count: results.length,
        folder: folder,
        files: formattedResults,
        detailedResults: results.map((result) => ({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          resource_type: result.resource_type,
          created_at: result.created_at,
        })),
      },
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
 * @route DELETE /api/file/cloud/delete
 * @access Public/Private (tùy thuộc vào middleware)
 */
const deleteFile = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp URL để xóa file",
      });
    }

    // Xóa file từ Cloudinary
    const result = await deleteFileService(url);

    // Kiểm tra kết quả và trả về phản hồi phù hợp
    if (result.result === "ok") {
      res.status(200).json({
        success: true,
        message: "File đã được xóa thành công",
        data: result,
      });
    } else if (result.result === "not found") {
      res.status(404).json({
        success: false,
        message: "File không tồn tại hoặc đã được xóa trước đó",
        data: result,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Không thể xóa file",
        data: result,
      });
    }
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
 * @route DELETE /api/file/cloud/delete/multiple
 * @access Public/Private (tùy thuộc vào middleware)
 */
const deleteMultipleFiles = async (req, res) => {
  try {
    const { files } = req.body;
    console.log("req.body:", req.body);

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cần cung cấp mảng URLs để xóa files",
      });
    }

    console.log("Đang xóa nhiều files:", files);

    // Xóa nhiều files từ Cloudinary
    const results = await deleteMultipleFilesService(files);

    // Thống kê kết quả
    const successful = results.filter((result) => !result.error && result.result === "ok");
    const notFound = results.filter((result) => !result.error && result.result === "not found");
    const failed = results.filter((result) => result.error);

    // Trả về phản hồi chi tiết
    res.status(200).json({
      success: true,
      message: `Hoàn thành xử lý ${files.length} files: ${successful.length} xóa thành công, ${notFound.length} không tồn tại, ${failed.length} thất bại`,
      data: {
        total: files.length,
        successful: successful.length,
        notFound: notFound.length,
        failed: failed.length,
        results: results,
      },
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
  uploadMultipleFiles,
  deleteFile,
  deleteMultipleFiles,
};
