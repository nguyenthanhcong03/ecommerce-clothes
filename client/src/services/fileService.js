import axios from '@/config/axios';
const BASE_API = '/api/file';

/**
 * Upload a single file to Cloudinary (public)
 * @param {File} file - The file to upload
 * @returns {Promise} - The uploaded file data
 */
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${BASE_API}/cloud/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * Upload multiple files to Cloudinary (public)
 * @param {File[]} files - Array of files to upload
 * @returns {Promise} - The uploaded files data
 */
export const uploadMultipleFiles = (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });
  console.log('formData entries', Array.from(formData.entries()));
  // Để axios tự thiết lập header, không chỉ định thủ công
  return axios.post(`${BASE_API}/cloud/upload/multiple`, formData);
};

/**
 * Delete a single file from Cloudinary using publicId or URL
 * @param {String} fileIdentifier - Public ID or URL of the file to delete
 * @returns {Promise} - Result of the delete operation
 */
export const deleteFile = (fileIdentifier) => {
  return axios.delete(`${BASE_API}/cloud/delete`, {
    data: fileIdentifier.includes('cloudinary.com') ? { url: fileIdentifier } : { publicId: fileIdentifier }
  });
};

/**
 * Delete multiple files from Cloudinary
 * @param {String[]} fileIdentifiers - Array of public IDs or URLs to delete
 * @returns {Promise} - Result of the delete operations
 */
export const deleteMultipleFiles = (fileIdentifiers) => {
  return axios.delete(`${BASE_API}/cloud/delete/multiple`, {
    data: { files: fileIdentifiers }
  });
};
