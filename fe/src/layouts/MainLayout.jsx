import { Outlet } from "react-router-dom";
import Header from "../components/Header"; 
import AIChat from "../components/AIChat";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
        <AIChat/>
      </main>
    </div>
  );
};

export default MainLayout;
