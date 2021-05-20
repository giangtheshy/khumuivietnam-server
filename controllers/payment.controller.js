import querystring from "qs";
import sha256 from "sha256";
import dateFormat from "dateformat";

import Bill from "../models/bill.model.js";
import Product from "../models/product.model.js";

const tmnCode = process.env.VNP_TMN_CODE;
const secretKey = process.env.VNP_HASH_SECRET;
let url = process.env.VNP_URL;
const returnUrl =
  process.env.NODE_ENV === "production"
    ? "https://khumuivietnam.com/tai-khoan/ket-qua-giao-dich"
    : process.env.VNP_RETURN_URL;

export const createPayment = async (req, res) => {
  try {
    const { info, amount, cart } = req.body;
    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    const bill = new Bill({ uid: req.user.id, info, cart });

    bill.save();

    let vnpUrl = url;
    const date = new Date();
    const createDate = dateFormat(date, "yyyymmddHHmmss");
    const orderId = bill._id.toString();
    const locale = "vn";

    const currCode = "VND";
    let vnp_Params = {};
    vnp_Params.vnp_Version = "2";
    vnp_Params.vnp_Command = "pay";
    vnp_Params.vnp_TmnCode = tmnCode;
    vnp_Params.vnp_Locale = locale;
    vnp_Params.vnp_CurrCode = currCode;
    vnp_Params.vnp_TxnRef = orderId;
    vnp_Params.vnp_OrderInfo = `Thanh toan don hang thoi gian: ${dateFormat(date, "yyyy-mm-dd HH:mm:ss")}`;
    vnp_Params.vnp_OrderType = "billpayment";
    vnp_Params.vnp_Amount = amount * 100;
    vnp_Params.vnp_ReturnUrl = returnUrl;
    vnp_Params.vnp_IpAddr = ipAddr;
    vnp_Params.vnp_CreateDate = createDate;

    vnp_Params.vnp_BankCode = "NCB";

    vnp_Params = sortObject(vnp_Params);
    const signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

    const secureHash = sha256(signData);

    vnp_Params.vnp_SecureHashType = "SHA256";
    vnp_Params.vnp_SecureHash = secureHash;

    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: true });
    res.status(200).json({ code: "00", data: vnpUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const returnPayment = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    vnp_Params = sortObject(vnp_Params);
    const signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

    const checkSum = sha256(signData);

    const id = vnp_Params.vnp_TxnRef;

    res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
    if (secureHash === checkSum) {
      if (vnp_Params.vnp_ResponseCode == "00") {
        const bill = await Bill.findByIdAndUpdate(id, { status: true }, { new: true });
        const handleProduct = async () => {
          bill.cart.forEach(async (item) => {
            const product = await Product.findById(item.productID);
            await Product.findByIdAndUpdate(item.productID, {
              inventory: product.inventory - item.quantity,
              sold: product.sold + item.quantity,
            });
          });
        };
        handleProduct();
        res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
      } else {
        // await Bill.findByIdAndDelete(id);
        res.status(200).json({ code: vnp_Params.vnp_ResponseCode });
      }
    } else {
      // await Bill.findByIdAndDelete(id);
      res.status(200).json({ code: "97" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const inpPayment = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    vnp_Params = sortObject(vnp_Params);

    const signData = secretKey + querystring.stringify(vnp_Params, { encode: false });

    const checkSum = sha256(signData);

    const id = vnp_Params.vnp_TxnRef;
    if (secureHash === checkSum) {
      if (vnp_Params.vnp_ResponseCode == "00") {
        const bill = await Bill.findByIdAndUpdate(id, { status: true }, { new: true });
        bill.cart.forEach(async (item) => {
          const product = await Product.findById(item.productID);
          await Product.findByIdAndUpdate(item.productID, {
            inventory: product.inventory - item.quantity,
            sold: product.sold + item.quantity,
          });
        });
        res.status(200).json({ RspCode: vnp_Params.vnp_ResponseCode, Message: "success" });
      } else {
        // await Bill.findByIdAndDelete(id);
        res.status(200).json({ RspCode: vnp_Params.vnp_ResponseCode, Message: "Fail checksum" });
      }
    } else {
      // await Bill.findByIdAndDelete(id);
      res.status(200).json({ RspCode: vnp_Params.vnp_ResponseCode, Message: "Fail checksum" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sortObject = (o) => {
  let sorted = {},
    key,
    a = [];

  for (key in o) {
    if (o.hasOwnProperty(key)) {
      a.push(key);
    }
  }

  a.sort();

  for (key = 0; key < a.length; key++) {
    sorted[a[key]] = o[a[key]];
  }
  return sorted;
};
