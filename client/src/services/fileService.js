import axios from '@/config/axios';
const BASE_API = '/api/file';

export const uploadFileAPI = (file, folder = 'uploads') => {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post(`${BASE_API}/cloud/upload?folder=${folder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const uploadMultipleFilesAPI = (files, folder = 'uploads') => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  return axios.post(`${BASE_API}/cloud/upload/multiple?folder=${folder}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const deleteFileAPI = (url) => {
  return axios.delete(`${BASE_API}/cloud/delete`, {
    data: url.includes('cloudinary.com') ? { url: url } : { publicId: url }
  });
};

export const deleteMultipleFilesAPI = (urls) => {
  return axios.delete(`${BASE_API}/cloud/delete/multiple`, {
    data: { files: urls }
  });
};
