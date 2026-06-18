export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 8;
};

export const validateName = (name) => {
    return name && name.trim().length >= 2 && name.trim().length <= 50;
};
