import Cart from '../models/cart.model.js'
export const addToCart = async (req, res) => {
  try {
    const id = req.user.id
    const data = req.body
    const cart = new Cart({ title: data.title, quantity: data.quantity, UID: id, productID: data._id, inventory: data.inventory, price: data.price, images: data.images })
    await cart.save()
    res.status(202).json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const removeFromCart = async (req, res) => {
  try {
    const id = req.params.id;
    const cart = await Cart.findByIdAndDelete(id);
    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const getCarts = async (req, res) => {
  try {
    const id = req.user.id

    const cart = await Cart.find({ UID: id })
    res.status(200).json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const incrementCart = async (req, res) => {
  try {
    const id = req.params.id;
    const cart = await Cart.findById(id);
    const newCart = await Cart.findByIdAndUpdate(id, { quantity: cart.quantity + 1 }, { new: true })
    res.status(200).json(newCart)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const decrementCart = async (req, res) => {
  try {
    const id = req.params.id;
    const cart = await Cart.findById(id);
    const newCart = await Cart.findByIdAndUpdate(id, { quantity: cart.quantity - 1 }, { new: true })
    res.status(200).json(newCart)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}