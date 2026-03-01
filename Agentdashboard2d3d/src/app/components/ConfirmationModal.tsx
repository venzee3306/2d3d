import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  messageMyanmar?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'success' | 'danger';
  details?: Array<{ label: string; value: string }>;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  messageMyanmar,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  details
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-green-600 to-emerald-600',
          icon: CheckCircle,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          buttonBg: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
        };
      case 'warning':
        return {
          gradient: 'from-yellow-600 to-orange-600',
          icon: AlertCircle,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          buttonBg: 'from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
        };
      case 'danger':
        return {
          gradient: 'from-red-600 to-rose-600',
          icon: AlertCircle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700'
        };
      default:
        return {
          gradient: 'from-blue-600 to-indigo-600',
          icon: AlertCircle,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${styles.gradient} px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10`}>
              <h3 className="text-white font-bold text-base sm:text-lg">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 pb-safe">
              {/* Icon */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className={`${styles.iconBg} w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${styles.iconColor}`} />
                </div>
              </div>

              {/* Message */}
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-gray-800 font-medium text-sm sm:text-base mb-1.5 sm:mb-2">
                  {message}
                </p>
                {messageMyanmar && (
                  <p className="text-gray-600 text-xs sm:text-sm" style={{ fontFamily: 'Pyidaungsu, Myanmar Text, sans-serif' }}>
                    {messageMyanmar}
                  </p>
                )}
              </div>

              {/* Details */}
              {details && details.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 space-y-2">
                  {details.map((detail, index) => (
                    <div key={index} className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm text-gray-600 truncate">{detail.label}</span>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 text-right">{detail.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r ${styles.buttonBg} text-white rounded-xl font-semibold text-sm shadow-lg transition-all active:scale-95`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
