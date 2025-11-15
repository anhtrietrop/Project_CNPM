import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpEmail } from "../utils/mail.js";

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    if (mobile.length < 10) {
      return res
        .status(400)
        .json({ message: "Mobile number must be at least 10 characters" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      mobile,
      role,
    });
    const token = await genToken(user._id);

    // SỬA: res.cookies() → res.cookie() và sửa template string
    res.cookie("token", token, {
      secure: false,
      sameSite: "lax", // Cho phép cookie với CORS
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // SỬA: $(error) → ${error}
    return res.status(500).json(`sign up error ${error}`);
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exists" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: "Tài khoản bị khóa. Vui lòng liên hệ admin." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    const token = await genToken(user._id);

    // SỬA: res.cookies() → res.cookie()
    res.cookie("token", token, {
      secure: false,
      sameSite: "lax", // Cho phép cookie với CORS
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // SỬA: $(error) → ${error}
    return res.status(500).json(`sign In error ${error}`);
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Log out successfully" });
  } catch (error) {
    // SỬA: $(error) → ${error}
    return res.status(500).json(`sign Out error ${error}`);
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User does not exists" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpiries = Date.now() + 5 * 60 * 1000; // OTP hợp lệ trong 5 phút
    await user.save();
    await sendOtpEmail(email.trim().toLowerCase(), otp);
    return res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    return res.status(500).json(`send otp error ${error}`);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email và OTP không được để trống",
      });
    }

    // Tìm user
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: "Không tìm thấy người dùng",
      });
    }

    // Log để debug (XÓA sau khi fix xong)
    console.log("User OTP:", user.resetOtp, typeof user.resetOtp);
    console.log("Input OTP:", otp, typeof otp);
    console.log("OTP Expiry:", user.otpExpiries);
    console.log("Current Time:", Date.now());

    // Kiểm tra OTP
    if (!user.resetOtp) {
      return res.status(400).json({
        message: "Vui lòng yêu cầu gửi OTP mới",
      });
    }

    // Convert cả 2 về string để so sánh
    if (user.resetOtp.toString() !== otp.toString()) {
      return res.status(400).json({
        message: "Mã OTP không đúng",
      });
    }

    // Kiểm tra hết hạn
    if (user.otpExpiries < Date.now()) {
      return res.status(400).json({
        message: "Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại",
      });
    }

    // Verify thành công
    user.isOtpVerified = true;
    await user.save();

    return res.status(200).json({
      message: "Xác thực OTP thành công",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      message: `Lỗi xác thực OTP: ${error.message}`,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "Otp verification required" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    user.resetOtp = undefined;
    user.otpExpiries = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json(`reset password error ${error}`);
  }
};
