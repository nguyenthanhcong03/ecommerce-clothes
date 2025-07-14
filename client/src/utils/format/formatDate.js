import dayjs from 'dayjs';

/**
 * Định dạng ngày tháng theo định dạng mong muốn
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
 */
export const formatDateTime = (date) => {
  return formatDate(date, 'DD/MM/YYYY HH:mm');
};

/**
 * Định dạng ngày tháng theo kiểu thân thiện (hôm nay, hôm qua, vv)
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
