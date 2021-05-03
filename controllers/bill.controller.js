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
