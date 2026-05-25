import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import Avatar from "../components/ui/Avatar";
import GradientButton from "../components/ui/GradientButton";
import CancelButton from "../components/ui/CancelButton";
import {
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  EnvelopeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { user, login } = useAuth(); // Беремо функцію login, щоб оновити дані в Сайдбарі

  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  // Стан для форми редагування
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Завантажуємо повні дані профілю з бекенду при відкритті сторінки
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        setProfileData(response.data);
        setFormData({
          name: response.data.name || "",
          phone: response.data.phone || "",
          address: response.data.defaultDeliveryAddress || "",
        });
      } catch (err) {
        setError("Не вдалося завантажити дані профілю");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Красиве форматування дати
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const handleSave = async () => {
    try {
      setError("");
      // Відправляємо оновлені дані на бекенд
      const response = await api.put("/users/profile", formData);

      // Оновлюємо локальний стан сторінки
      setProfileData(response.data.user);

      // ОНОВЛЮЄМО ГЛОБАЛЬНИЙ СТАН!
      // Щоб Сайдбар і сторінка Оформлення миттєво дізналися про нову адресу/ім'я
      const newToken = localStorage.getItem("token");
      login({ ...user, ...response.data.user }, newToken);

      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || "Помилка при збереженні даних");
    }
  };

  const handleCancelEdit = () => {
    // Відкочуємо дані у формі до оригінальних
    setFormData({
      name: profileData.name || "",
      phone: profileData.phone || "",
      address: profileData.defaultDeliveryAddress || "",
    });
    setIsEditing(false);
    setError("");
  };

  if (isLoading)
    return (
      <div className="flex justify-center mt-20 font-semibold text-brand-dark">
        Завантаження профілю...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-10">
      {/* Шапка профілю (Аватар та дата) */}
      <div className="bg-white rounded-t-3xl p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left shadow-sm mt-6">
        <Avatar
          name={profileData?.name}
          role={profileData?.role}
          size="large"
        />

        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-gray-800">
            {profileData?.name}
          </h1>
          <p className="text-brand-orange font-semibold tracking-wide uppercase text-sm mt-1">
            {profileData?.role === "CUSTOMER" ? "Клієнт" : profileData?.role}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mt-3 text-sm">
            <CalendarIcon className="w-5 h-5" />
            <span>З нами з {formatDate(profileData?.createdAt)}</span>
          </div>
        </div>

        {!isEditing && (
          <GradientButton onClick={() => setIsEditing(true)} className="px-8">
            Редагувати профіль
          </GradientButton>
        )}
      </div>

      {/* Основний блок даних */}
      <div className="bg-white rounded-b-3xl shadow-md p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Email (Ніколи не редагується) */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 pb-6 border-b border-gray-50">
            <div className="w-48 text-gray-400 flex items-center gap-2 font-medium">
              <EnvelopeIcon className="w-5 h-5" /> Email-адреса
            </div>
            <div className="flex-1 text-gray-800 font-semibold">
              {profileData?.email}
            </div>
          </div>

          {/* Ім'я */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 pb-6 border-b border-gray-50">
            <div className="w-48 text-gray-400 flex items-center gap-2 font-medium">
              <UserIcon className="w-5 h-5" /> Повне ім'я
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              ) : (
                <div className="text-gray-800 font-semibold">
                  {profileData?.name}
                </div>
              )}
            </div>
          </div>

          {/* Телефон */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 pb-6 border-b border-gray-50">
            <div className="w-48 text-gray-400 flex items-center gap-2 font-medium">
              <PhoneIcon className="w-5 h-5" /> Номер телефону
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+380..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow"
                />
              ) : (
                <div className="text-gray-800 font-semibold">
                  {profileData?.phone || "Не вказано"}
                </div>
              )}
            </div>
          </div>

          {/* Адреса */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
            <div className="w-48 text-gray-400 flex items-center gap-2 font-medium ">
              <MapPinIcon className="w-5 h-5" /> Адреса доставки
            </div>
            <div className="flex-1">
              {isEditing ? (
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows="3"
                  placeholder="Місто, вулиця, будинок..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-yellow resize-none"
                />
              ) : (
                <div className="text-gray-800 font-semibold leading-relaxed">
                  {profileData?.defaultDeliveryAddress || "Не вказано"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Блок кнопок збереження (Показується тільки під час редагування) */}
        {isEditing && (
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-end animate-fade-in">
            <div className="w-full sm:w-48">
              <CancelButton onClick={handleCancelEdit}>Скасувати</CancelButton>
            </div>
            <div className="w-full sm:w-48">
              <GradientButton onClick={handleSave} className="w-full">
                Зберегти зміни
              </GradientButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
