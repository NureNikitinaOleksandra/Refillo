export default function Avatar({ name, role, size = "large" }) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  // Визначаємо розміри
  const sizeClasses = {
    small: "w-10 h-10 text-lg",
    medium: "w-16 h-16 text-2xl",
    large: "w-24 h-24 text-4xl",
  };

  // Визначаємо фон за роллю
  let bgClass = "bg-brand-dark"; // За замовчуванням (або для адмінів)
  if (role === "CUSTOMER")
    bgClass = "bg-gradient-to-r from-brand-yellow to-brand-orange";
  if (role === "EMPLOYEE") bgClass = "bg-brand-yellow";
  if (role === "COURIER") bgClass = "bg-brand-orange";

  return (
    <div
      className={`${sizeClasses[size]} ${bgClass} text-white font-black rounded-full flex items-center justify-center shadow-md`}
    >
      {initial}
    </div>
  );
}
