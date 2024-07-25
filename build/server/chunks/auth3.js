const signin = {
  title: "Signin",
  signinButton: "Let me in",
  rememberMe: "Remember me",
  noAccount: "Don't have an account?",
  forgotPassword: "Forgot password?"
};
const signup = {
  title: "Signup",
  signupButton: "Create account",
  firstNamePlaceholder: "Please enter your first name *",
  lastNamePlaceholder: "Please enter your last name *",
  confirmPasswordPlaceholder: "Please confirm your password *",
  agreeToTerms: "I agree to the terms and conditions",
  alreadyHasAccount: "Already have an account?"
};
const resetPassword = {
  title: "Reset Password",
  btnText: "Send me email"
};
const common = {
  emailPlaceholder: "Please enter your email *",
  passwordPlaceholder: "Please enter your password *"
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
