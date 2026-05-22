import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function SidebarLayout() {
  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar />
      {/* Контент займає всю ширину, що залишилася, 
        і має відступ зліва (ml-72), що дорівнює ширині сайдбару 
      */}
      <main className="flex-1 ml-72 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* <Outlet /> - це місце, куди React Router буде підставляти наші сторінки */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
