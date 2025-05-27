import axios from 'axios';
const MAPBOX_TOKEN =
  'pk.eyJ1Ijoibmd1eWVudGhhbmhjb25nMDMiLCJhIjoiY21hODQ5dnUwMTQwajJscHc1bW93eWQ4NSJ9.ItXZ4G8QVf0wFZcqev7_WQ';

// export const getLocateAPI = () => {
//   return axios.get(
//     `https://api.mapbox.com/geocoding/v5/mapbox.places/"${address}".json?access_token=${MAPBOX_TOKEN}`
//   );
// };

const PROVINCE_API = 'https://provinces.open-api.vn/api/';

export const getProvincesAPI = async () => {
  try {
    const response = await axios.get(`${PROVINCE_API}p`);
    return response.data.map((province) => ({
      label: province.name,
      value: province.code
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

export const getDistrictsAPI = async (provinceCode) => {
  try {
    const response = await axios.get(`${PROVINCE_API}p/${provinceCode}?depth=2`);
    console.log('response', response);
    return response.data.districts.map((district) => ({
      label: district.name,
      value: district.code
    }));
    // return response.data.districts;
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

export const getWardsAPI = async (districtCode) => {
  try {
    const response = await axios.get(`${PROVINCE_API}d/${districtCode}?depth=2`);
    return response.data.wards.map((ward) => ({
      label: ward.name,
      value: ward.code
    }));
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
};

// // API để lấy gợi ý địa chỉ
// export const getAddressSuggestions = async (query, country = 'vn') => {
//   try {
//     const response = await axios.get(
//       `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
//       {
//         params: {
//           access_token: MAPBOX_TOKEN,
//           country,
//           language: 'vi',
//           limit: 5,
//           types: 'address,place,locality,neighborhood'
//         }
//       }
//     );

//     return response.data.features.map((feature) => ({
//       id: feature.id,
//       text: feature.place_name,
//       place_name: feature.place_name,
//       center: feature.center
//     }));
//   } catch (error) {
//     console.error('Error getting address suggestions:', error);
//     return [];
//   }
// };

// export const getCoordinatesAPI = async (address) => {
//   const response = await axios.get(
//     `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
//     {
//       params: {
//         access_token: MAPBOX_TOKEN,
//         limit: 1
//       }
//     }
//   );

//   const [lon, lat] = response.data.features[0]?.center || [];
//   return { lat, lon };
// };

// export const calculateDistanceAPI = async (from, to) => {
//   const coord1 = await getCoordinatesAPI(from);
//   const coord2 = await getCoordinatesAPI(to);

//   const res = await axios.get(
//     `https://api.mapbox.com/directions/v5/mapbox/driving/${coord1.lon},${coord1.lat};${coord2.lon},${coord2.lat}`,
//     {
//       params: {
//         access_token: MAPBOX_TOKEN,
//         geometries: 'geojson'
//       }
//     }
//   );

//   const distanceInMeters = res.data.routes[0]?.distance || 0;
//   return distanceInMeters / 1000; // Trả về km
// };

// // Tính phí vận chuyển dựa trên tỉnh và quận/huyện
// export const calculateShippingFeeByDistrict = async (provinceCode, districtCode) => {
//   if (!provinceCode || !districtCode) return 0;

//   try {
//     // Lấy thông tin province
//     const provinceResponse = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=1`);
//     const provinceName = provinceResponse.data.name;

//     // Lấy thông tin district
//     const districtResponse = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=1`);
//     const districtName = districtResponse.data.name;
//     console.log('provinceName', provinceName);
//     console.log('districtName', districtName);

//     // Tạo địa chỉ để tìm tọa độ
//     const customerLocation = `${districtName}, ${provinceName}, Việt Nam`;
//     const storeLocation = 'Trung Liệt, 11500, Đống Đa, Hà Nội, Việt Nam';

//     // Sử dụng API để tính khoảng cách
//     const distance = await calculateDistanceAPI(storeLocation, customerLocation);

//     // Tính phí ship dựa trên khoảng cách
//     return calculateShippingFee(distance);
//   } catch (error) {
//     console.error('Error calculating shipping fee by district:', error);
//     return 15000; // Trả về phí mặc định nếu có lỗi
//   }
// };

// OpenStreetMap và OSRM (Open Source Routing Machine)
export const getCoordsAPI = async (address) => {
  const res = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: address,
      format: 'json'
    }
  });

  const data = res.data;
  return [data[0].lon, data[0].lat]; // [lng, lat]
};

export const getDistanceAPI = async (fromAddress, toAddress) => {
  const [lng1, lat1] = await getCoordsAPI(fromAddress);
  const [lng2, lat2] = await getCoordsAPI(toAddress);

  const res = await axios.get(`https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}`, {
    params: {
      overview: 'false'
    }
  });
  const distance = res.data.routes[0]?.distance || 0; // Trả về đơn vị là mét
  return distance / 1000; // Chuyển đổi sang km
};

// Tính phí vận chuyển dựa trên khoảng cách
export const calculateShippingFee = (distance) => {
  if (!distance || distance < 0) return 0;

  // Làm tròn lên distance
  distance = Math.ceil(distance);

  if (distance <= 0) return 0;

  const baseFee = 15000; // Phí cơ bản cho 3km đầu tiên
  const baseDistance = 3; // Số km miễn phí hoặc tính cơ bản
  const extraFeePerKm = 5000; // Phí cho mỗi km vượt quá

  if (distance <= baseDistance) {
    return baseFee;
  } else {
    const extraDistance = Math.ceil(distance - baseDistance);
    return baseFee + extraDistance * extraFeePerKm;
  }
};
