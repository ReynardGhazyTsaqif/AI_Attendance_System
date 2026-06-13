import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F6]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-30
            lg:sticky lg:top-0 lg:z-auto lg:h-dvh lg:shrink-0
            transition-transform duration-200
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile topbar */}
          <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
              aria-label="Buka menu"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>

            <img
              src="/LogoTitle.png"
              alt="PresenAI"
              className="h-10 w-auto object-contain mr-auto"
            />
          </div>

          <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
