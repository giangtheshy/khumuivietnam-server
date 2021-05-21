import Post from "../models/post.model.js";
import cloudinary from "../utils/cloudinary/index.js";

export const createPost = async (req, res) => {
  try {
    if (req.user.role * 1 <= 1) return res.status(400).json({ message: "Access have been denied" });
    let data = req.body;
    data.image = await uploadImage(data.image);
    const upload = new Promise(async (resolve, reject) => {
      let temp = [];
      data.contents.forEach(async (content, index) => {
        let multipleUpload = new Promise(async (resolve, reject) => {
          let upload_len = content.content.length,
            upload_res = new Array();

          for (let i = 0; i <= upload_len + 1; i++) {
            let obj = content.content[i];
            let filePath = obj?.image;
            await cloudinary.uploader.upload(
              filePath,
              {
                upload_preset: "khumuivietnam",
              },
              (error, result) => {
                if (upload_res.length === upload_len) {
                  resolve({ index: index, data: { title: content.title, content: upload_res } });
                } else if (result) {
                  const temp = { ...content.content[i], image: result.secure_url };
                  upload_res.push(temp);
                } else if (error) {
                  console.log(error);
                  reject(error);
                }
              }
            );
          }
        })
          .then((result) => result)
          .catch((error) => error);
        const contentMap = await multipleUpload;
        temp.push(contentMap);
        if (temp.length === data.contents.length) {
          resolve(temp);
        }
      });
    })
      .then((result) => result)
      .catch((error) => error);
    const contentsRaw = await upload;
    contentsRaw.sort((a, b) => a.index - b.index);

    const newContents = contentsRaw.map((content) => content.data);

    const post = new Post({
      ...data,
      contents: newContents,
      createdAt: new Date().getTime(),
      parseLink: data.title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase(),
    });
    await post.save();

    res.status(202).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getPost = async (req, res) => {
  try {
    const title = req.params.title;
    const post = await Post.findOne({ parseLink: title });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updatePost = async (req, res) => {
  try {
    if (req.user.role * 1 <= 1) return res.status(400).json({ message: "Access have been denied" });
    let data = req.body;
    data.image = await uploadImage(data.image);
    const upload = new Promise(async (resolve, reject) => {
      let temp = [];
      data.contents.forEach(async (content, index) => {
        let multipleUpload = new Promise(async (resolve, reject) => {
          let upload_len = content.content.length,
            upload_res = new Array();

          for (let i = 0; i <= upload_len + 1; i++) {
            let obj = content.content[i];
            let filePath = obj?.image;
            await cloudinary.uploader.upload(
              filePath,
              {
                upload_preset: "khumuivietnam",
              },
              (error, result) => {
                if (upload_res.length === upload_len) {
                  resolve({ index: index, data: { title: content.title, content: upload_res } });
                } else if (result) {
                  const temp = { ...content.content[i], image: result.secure_url };
                  upload_res.push(temp);
                } else if (error) {
                  console.log(error);
                  reject(error);
                }
              }
            );
          }
        })
          .then((result) => result)
          .catch((error) => error);
        const contentMap = await multipleUpload;
        temp.push(contentMap);
        if (temp.length === data.contents.length) {
          resolve(temp);
        }
      });
    })
      .then((result) => result)
      .catch((error) => error);
    const contentsRaw = await upload;
    contentsRaw.sort((a, b) => a.index - b.index);

    const newContents = contentsRaw.map((content) => content.data);

    await Post.findByIdAndUpdate(data._id, {
      ...data,
      contents: newContents,
      parseLink: data.title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase(),
    });

    res.status(202).json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const removePost = async (req, res) => {
  try {
    if (req.user.role * 1 <= 1) return res.status(400).json({ message: "Access have been denied" });
    const id = req.params.id;
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadImage = (filePath) => {
  return new Promise(async (resolve, reject) => {
    await cloudinary.uploader.upload(
      filePath,
      {
        upload_preset: "khumuivietnam",
      },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else if (error) {
          console.log(error);
          reject(error);
        }
      }
    );
  })
    .then((result) => result)
    .catch((error) => error);
};
