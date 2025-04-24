// utils/validateInput.ts

interface ValidationResult {
    isValid: boolean;
    message?: string;
  }
  
  export const validateEmail = (email: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { isValid: false, message: 'Email is required.' };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format.' };
    }
    return { isValid: true };
  };
  
  export const validatePassword = (password: string): ValidationResult => {
    if (!password) {
      return { isValid: false, message: 'Password is required.' };
    }
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    return { isValid: true };
  };
  
  export const validateName = (name: string): ValidationResult => {
    if (!name) {
      return { isValid: false, message: 'Name is required.' };
    }
    if (name.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters long.' };
    }
    return { isValid: true };
  };
  
  export const validateCompanyName = (companyName: string): ValidationResult => {
    if (!companyName) {
      return { isValid: false, message: 'Company name is required.' };
    }
    if (companyName.length < 2) {
      return { isValid: false, message: 'Company name must be at least 2 characters long.' };
    }
    return { isValid: true };
  };
  
  // Add more validators as needed
  
  