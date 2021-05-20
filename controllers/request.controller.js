import Request from "../models/request.model.js";
import User from "../models/user.model.js";

export const createRequest = async (req, res) => {
  try {
    const data = req.body;
    const request = new Request({ ...data });
    request.save();
    res.status(200).json({ message: "Request successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const confirmRequest = async (req, res) => {
  try {
    if (req.user.role * 1 <= 1) return res.status(400).json({ message: "Access have been denied" });
    const request = await Request.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(request.uid, { role: 1 });

    res.status(200).json({ message: "Actions have been successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteRequest = async (req, res) => {
  try {
    if (req.user.role * 1 <= 1) return res.status(400).json({ message: "Access have been denied" });
    await Request.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Actions have been successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllRequest = async (req, res) => {
  try {
    if (req.user.role * 1 <= 1) return res.status(400).json({ message: "Access have been denied" });
    const requests = await Request.find();

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
