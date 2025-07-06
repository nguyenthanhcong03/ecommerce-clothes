const removeVietnameseTones = (str) => {
  const vietnameseToASCII = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  return str.replace(
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g,
    (char) => vietnameseToASCII[char] || char
  );
};

/**
 * Tạo SKU tự động cho biến thể sản phẩm
 * @param {String} productType - Loại sản phẩm (áo, quần)
 * @param {String} productName - Tên sản phẩm
 * @param {String} brand - Thương hiệu
 * @param {String} size - Kích thước
 * @param {String} color - Màu sắc
 * @returns {String} SKU được tạo
 */
const generateSKU = (productType, productName, brand, size, color) => {
  try {
    // Xác định loại sản phẩm (áo hoặc quần)
    let typeCode = "SP"; // Mặc định là sản phẩm

    if (productType) {
      if (productType.toLowerCase().includes("áo")) {
        typeCode = "AO";
      } else if (productType.toLowerCase().includes("quần")) {
        typeCode = "QU";
      }
    }

    // Tạo mã thương hiệu (3 ký tự đầu)
    const brandCode = removeVietnameseTones(brand.trim().toUpperCase()).slice(0, 3);

    // Tạo mã sản phẩm từ chữ cái đầu của mỗi từ
    const productCode = removeVietnameseTones(productName.trim().toUpperCase())
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 5);

    // Tạo mã size
    const sizeCode = size.toUpperCase();

    // Tạo mã màu (loại bỏ dấu và khoảng trắng)
    const colorCode = removeVietnameseTones(color.trim().toUpperCase()).replace(/\s+/g, "");

    // Tạo timestamp để đảm bảo tính duy nhất
    const timestamp = Date.now().toString().slice(-4);

    // Format: TYPE-BRAND-NAME-SIZE-COLOR-TIMESTAMP
    return `${typeCode}-${brandCode}-${productCode}-${sizeCode}-${colorCode}-${timestamp}`.toUpperCase();
  } catch (error) {
    console.error("Error generating SKU:", error);
    return `SP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
  }
};

module.exports = { generateSKU };
