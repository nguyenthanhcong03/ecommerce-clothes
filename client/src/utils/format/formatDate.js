import dayjs from 'dayjs';

/**
 * Định dạng ngày tháng theo định dạng mong muốn
 *
 * @param {string|Date} date - Chuỗi ngày hoặc đối tượng Date cần định dạng
 * @param {string} format - Định dạng mong muốn, mặc định là 'DD/MM/YYYY'
 * @returns {string} Chuỗi ngày tháng đã được định dạng
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';

  try {
    return dayjs(date).format(format);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Định dạng ngày tháng kèm theo giờ
 *
 * @param {string|Date} date - Chuỗi ngày hoặc đối tượng Date cần định dạng
 * @returns {string} Chuỗi ngày tháng kèm giờ đã được định dạng
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'DD/MM/YYYY HH:mm');
};

/**
 * Định dạng ngày tháng theo kiểu thân thiện (hôm nay, hôm qua, vv)
 *
 * @param {string|Date} date - Chuỗi ngày hoặc đối tượng Date cần định dạng
 * @returns {string} Chuỗi ngày tháng đã được định dạng thân thiện
 */
export const formatDateFromNow = (date) => {
  if (!date) return '';

  try {
    return dayjs(date).fromNow();
  } catch (error) {
    console.error('Error formatting relative date:', error);
    return '';
  }
};

/**
 * Kiểm tra xem một ngày đã qua hay chưa
 *
 * @param {string|Date} date - Chuỗi ngày hoặc đối tượng Date cần kiểm tra
 * @returns {boolean} true nếu ngày đã qua, false nếu không
 */
export const isDatePast = (date) => {
  if (!date) return false;

  try {
    return dayjs(date).isBefore(dayjs());
  } catch (error) {
    console.error('Error checking if date is past:', error);
    return false;
  }
};

/**
 * So sánh hai ngày
 *
 * @param {string|Date} date1 - Ngày thứ nhất cần so sánh
 * @param {string|Date} date2 - Ngày thứ hai cần so sánh
 * @returns {number} 1 nếu date1 > date2, -1 nếu date1 < date2, 0 nếu bằng nhau
 */
export const compareDates = (date1, date2) => {
  if (!date1 || !date2) return 0;

  try {
    const d1 = dayjs(date1);
    const d2 = dayjs(date2);

    if (d1.isAfter(d2)) return 1;
    if (d1.isBefore(d2)) return -1;
    return 0;
  } catch (error) {
    console.error('Error comparing dates:', error);
    return 0;
  }
};

export default formatDate;
