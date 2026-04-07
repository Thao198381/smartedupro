import React from "react";

interface WarningToastProps {
  message: string;
  count: number;
  max: number;
}

const WarningToast: React.FC<WarningToastProps> = ({ message, count, max }) => {
  return (
    <div className="fixed top-4 right-4 z-[99999] bg-red-600 text-white px-4 py-3 rounded-xl shadow-xl animate-pulse">
      <div className="font-bold text-sm">⚠ Cảnh báo vi phạm</div>
      <div className="text-xs mt-1">{message}</div>
      <div className="text-xs mt-1 font-bold">
        Vi phạm {count}/{max}
      </div>
    </div>
  );
};

export default WarningToast;
