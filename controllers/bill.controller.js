import Bill from "../models/bill.model.js";

export const getBillByUser = async (req, res) => {
  try {
    const uid = req.user.id;
    const bills = await Bill.find({ uid, status: true });

    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllBills = async (req, res) => {
  try {
    const role = req.user.role;
    if (role <= 1) return res.status(404).json({ message: "Access have been denied" });
    const bills = await Bill.find();

    res.status(200).json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
