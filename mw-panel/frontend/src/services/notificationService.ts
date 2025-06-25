// Service for showing notifications
let showError = (message: string) => console.error('Error:', message);
let showSuccess = (message: string) => console.log('Success:', message);
let showWarning = (message: string) => console.warn('Warning:', message);
let showInfo = (message: string) => console.info('Info:', message);

export const notificationService = {
  setHandlers: (handlers: {
    error: (message: string) => void;
    success: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  }) => {
    showError = handlers.error;
    showSuccess = handlers.success;
    showWarning = handlers.warning;
    showInfo = handlers.info;
  },
  
  error: (message: string) => showError(message),
  success: (message: string) => showSuccess(message),
  warning: (message: string) => showWarning(message),
  info: (message: string) => showInfo(message),
};