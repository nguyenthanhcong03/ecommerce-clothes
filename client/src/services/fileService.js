import axios from '@/config/axios';
const BASE_API = '/api/file';

export const uploadFile = (file, folder = 'uploads') => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${BASE_API}/cloud/upload?folder=${folder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadMultipleFiles = (files, folder = 'uploads') => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  // Log FormData content to console for debugging
  console.log('FormData content:');
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  return axios.post(`${BASE_API}/cloud/upload/multiple?folder=${folder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteFile = (fileIdentifier) => {
  return axios.delete(`${BASE_API}/cloud/delete`, {
    data: fileIdentifier.includes('cloudinary.com') ? { url: fileIdentifier } : { publicId: fileIdentifier }
  });
};

export const deleteMultipleFiles = (fileIdentifiers) => {
  return axios.delete(`${BASE_API}/cloud/delete/multiple`, {
    data: { files: fileIdentifiers }
  });
};
