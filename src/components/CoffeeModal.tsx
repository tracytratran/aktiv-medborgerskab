import React from "react";
import { BASE_PATH } from "../App";
import { useAppTranslation } from "../hooks/useAppTranslation";

interface CoffeeModalProps {
  onClose: () => void;
}

const CoffeeModal: React.FC<CoffeeModalProps> = ({ onClose }) => {
  const { t } = useAppTranslation();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="self-end text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          aria-label={t("close")}
        >
          ✕
        </button>

        <img
          src={`${BASE_PATH}/images/mobilepay-qrcode.jpg`}
          alt="MobilePay QR code"
          className="w-56 h-56 object-contain rounded-lg"
        />

        <p className="text-lg font-semibold text-gray-800">Hong Tra Tran</p>

        <p className="text-sm text-gray-600 text-center leading-relaxed">
          {t("donate.message")}
        </p>
      </div>
    </div>
  );
};

export default CoffeeModal;
