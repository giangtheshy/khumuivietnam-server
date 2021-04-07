import Product from '../models/product.model.js'
import Post from '../models/post.model.js';
import convert from '../utils/functions/convert.js';
import cloudinary from '../utils/cloudinary/index.js';


export const createProduct = async (req, res) => {
  try {
    const id = req.user
    const role = req.role
    const data = req.body
    if (role >= 1) {

      let multipleUpload = new Promise(async (resolve, reject) => {
        let upload_len = data.images.length
          , upload_res = new Array();

        for (let i = 0; i <= upload_len + 1; i++) {
          let filePath = data.images[i];
          await cloudinary.uploader.upload(filePath, {
            upload_preset: 'khumuivietnam',
          }, (error, result) => {

            if (upload_res.length === upload_len) {
              resolve(upload_res)
            } else if (result) {
              upload_res.push(result.secure_url);
            } else if (error) {
              console.log(error)
              reject(error)
            }

          })

        }
      })
        .then((result) => result)
        .catch((error) => error)
      const images = await multipleUpload;
      const product = new Product({ ...data, createdAt: new Date().getTime(), UID: id, images: images });
      await product.save();
      res.status(202).json(product);
    }

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

export const searchProducts = async (req, res) => {
  const search = req.body.search
  try {
    const products = await Product.find()
    const posts = await Post.find()
    const searchProducts = products.filter(item => convert(item.title).includes(convert(search)))
    const searchPosts = posts.filter(item => convert(item.title).includes(convert(search)))
    res.status(200).json({ products: searchProducts, posts: searchPosts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}