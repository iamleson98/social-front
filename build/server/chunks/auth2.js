const signin = {
  title: "Đăng nhập",
  signinButton: "Đăng nhập",
  rememberMe: "Ghi nhớ đăng nhập",
  noAccount: "Bạn chưa có tài khoản?",
  forgotPassword: "Bạn quên mật khẩu?"
};
const signup = {
  title: "Đăng ký",
  signupButton: "Tạo tài khoản",
  firstNamePlaceholder: "Vui lòng nhập họ *",
  lastNamePlaceholder: "Vui lòng nhập tên *",
  confirmPasswordPlaceholder: "Vui lòng xác nhận mật khẩu *",
  agreeToTerms: "Tôi đồng ý với các điều khoản và điều kiện",
  alreadyHasAccount: "Bạn đã có tài khoản?"
};
const resetPassword = {
  title: "Yêu cầu đặt lại mật khẩu",
  btnText: "Gửi email cho tôi"
};
const common = {
  emailPlaceholder: "Vui lòng điền email *",
  passwordPlaceholder: "Vui lòng điền mật khẩu *"
};
const auth = {
  signin,
  signup,
  resetPassword,
  common
};
export {
  common,
  auth as default,
  resetPassword,
  signin,
  signup
};
