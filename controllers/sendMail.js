import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";

dotenv.config();
const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS,
} = process.env;

const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
);

const sendEMail = (to, url, text) => {
  oauth2Client.setCredentials({ refresh_token: MAILING_SERVICE_REFRESH_TOKEN });

  const accessToken = oauth2Client.getAccessToken();

  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: SENDER_EMAIL_ADDRESS,
      clientId: MAILING_SERVICE_CLIENT_ID,
      clientSecret: MAILING_SERVICE_CLIENT_SECRET,
      refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
      accessToken,
    },
  });
  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to: to,
    subject: "ADMIN khumuivietnam Website",
    html: `
        <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;text-align:center;">
        <h2 style="text-align: center; text-transform: uppercase;color: teal;">Chào mừng bạn đến với khumuivietnam.</h2>
        <p>Chúc mừng bạn đã đăng ký thành công tài khoản tại khumuivietnam.com.
            Chỉ còn 1 bước cuối cùng để kích hoạt tài khoản, Click nút phía bên dưới để xác nhận tài khoản.
        </p>
        
        <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;border-radius:0.5rem;font-weight: bold;box-shadow:0 3px 6px crimson;text-transform: uppercase">${text}</a>
    
        <p>Nếu click vào nút phía trên mà không được thì bạn có thể đi đến địa chỉ trang web phía dưới:</p>
    
        <div>${url}</div>
        </div>
    `,
  };
  smtpTransport.sendMail(mailOptions, (err, info) => {
    if (err) return err;
    return info;
  });
};
export default sendEMail;
