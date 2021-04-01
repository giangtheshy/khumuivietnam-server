import Product from '../models/product.model.js'

export const createProduct = async (req, res) => {
  try {
    const data = req.body
    const product = new Product({ ...data, createdAt: new Date().getTime() })
    await product.save();
    res.status(202).json(product);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id)
    if (!product) res.status(404).json({ message: "Không tìm thấy sản phẩm này!" })
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}