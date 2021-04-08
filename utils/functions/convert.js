const convert = (string) => {
  return string.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
}
export default convert