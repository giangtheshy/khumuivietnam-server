import Post from '../models/post.model.js'
export const createPost = async (req, res) => {
  try {
    const data = req.body
    const post = new Post({
      ...data, createdAt: new Date().getTime(), parseLink: data.title.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase()
    })
    await post.save()
    res.status(202).json(post)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const getPost = async (req, res) => {
  try {
    const title = req.params.title
    const post = await Post.findOne({ parseLink: title })
    res.status(200).json(post)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
    res.status(200).json(posts)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}