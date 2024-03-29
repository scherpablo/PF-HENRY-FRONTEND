const validateName = (name) => {
  if (typeof name !== "string" || /\d/.test(name)) {
    return false;
  }
  if (name.length < 3) {
    return false;
  }
  return true;
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

const validateEmail = (email) => {
  const emailRegex = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
  return emailRegex.test(email);
};

const validateArea = (area) => {
  if (area.length < 50 || area.length > 250) {
    return false;
  }
  return true;
};

export { validateName, validatePhone, validateEmail, validateArea };
