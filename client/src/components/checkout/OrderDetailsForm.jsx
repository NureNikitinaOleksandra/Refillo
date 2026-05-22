import { useAuth } from "../../contexts/AuthContext";
import {
  MapPinIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function OrderDetailsForm({
  orderMode,
  address,
  setAddress,
  deliveryTime,
  setDeliveryTime,
  frequencyDays,
  setFrequencyDays,
}) {
  const { user } = useAuth();
  // Колір акцентів залежно від режиму
  const focusColor =
    orderMode === "ONE_TIME"
      ? "focus:ring-brand-yellow"
      : "focus:ring-brand-orange";

  // Локальний стан для частоти, чи обрав клієнт "Свій варіант"
  const [isCustomFrequency, setIsCustomFrequency] = useState(false);

  const handleFrequencyChange = (e) => {
    const val = e.target.value;
    if (val === "CUSTOM") {
      setIsCustomFrequency(true);
      setFrequencyDays(3); // Дефолтне значення для кастомного вводу
    } else {
      setIsCustomFrequency(false);
      setFrequencyDays(Number(val));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-1">
          <MapPinIcon className="w-4 h-4" /> Адреса доставки
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={user?.defaultDeliveryAddress || "Введіть адресу..."}
          className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all ${focusColor}`}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-1">
          <ClockIcon className="w-4 h-4" /> Бажаний час доставки
        </label>
        <input
          type="datetime-local"
          value={deliveryTime}
          onChange={(e) => setDeliveryTime(e.target.value)}
          className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 transition-all ${focusColor}`}
        />
      </div>

      {/* Показуємо частоту тільки для підписок */}
      {orderMode === "SUBSCRIPTION" && (
        <div className="animate-fade-in">
          <label className="flex items-center gap-2 text-sm font-bold text-brand-dark mb-1">
            <CalendarDaysIcon className="w-4 h-4" /> Як часто доставляти?
          </label>
          <select
            value={isCustomFrequency ? "CUSTOM" : frequencyDays}
            onChange={handleFrequencyChange}
            className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 cursor-pointer transition-all ${focusColor}`}
          >
            <option value={7}>Кожні 7 днів (Тиждень)</option>
            <option value={14}>Кожні 14 днів (Два тижні)</option>
            <option value={30}>Кожні 30 днів (Місяць)</option>
            <option value="CUSTOM">Свій варіант...</option>
          </select>

          {/* Додаткове поле для кастомного вводу */}
          {isCustomFrequency && (
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="text-sm text-gray-500">Кожні</span>
              <input
                type="number"
                min="1"
                max="90"
                value={frequencyDays}
                onChange={(e) => setFrequencyDays(Number(e.target.value))}
                className={`w-20 p-2 text-center bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 ${focusColor}`}
              />
              <span className="text-sm text-gray-500">днів</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
