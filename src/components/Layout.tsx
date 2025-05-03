import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 relative">
      <Header />
      {children}
      <Footer />
      {/* Add padding to prevent content from being hidden behind the fixed footer */}
      <div className="pb-32 sm:pb-24"></div>
    </div>
  );
};

export default Layout;
