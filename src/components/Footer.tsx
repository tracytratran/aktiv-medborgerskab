import React from "react";

const Footer: React.FC = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-white bg-opacity-95 shadow-lg p-4 z-10">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left order-2 sm:order-1">
                    {new Date().getFullYear()} Tracy Tra Tran. All rights
                    reserved.
                </p>

                {/* Social buttons */}
                <div className="flex gap-2 order-1 sm:order-2">
                    <a
                        href="https://www.linkedin.com/in/tracytratran"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-4 bg-[#0077b5] border-2 border-[#0077b5] text-white rounded-lg text-sm font-medium hover:bg-[#006396] hover:border-[#006396] transition-colors flex items-center justify-center gap-1 shadow-md opacity-75 hover:opacity-100"
                    >
                        LinkedIn
                        <svg
                            className="w-4 h-4 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
