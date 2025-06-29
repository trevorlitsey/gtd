import React from "react";
import { Folder } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  onLogout: () => void;
  tasks: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, tasks }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar items with task counts
  const sidebarItems = [
    {
      id: "inbox",
      label: "Inbox",
      count: tasks.filter((t) => t.status === "inbox").length,
    },
    {
      id: "next",
      label: "Next Actions",
      count: tasks.filter((t) => t.status === "next").length,
    },
    {
      id: "waiting",
      label: "Waiting For",
      count: tasks.filter((t) => t.status === "waiting").length,
    },
    {
      id: "someday",
      label: "Someday/Maybe",
      count: tasks.filter((t) => t.status === "someday").length,
    },
    {
      id: "done",
      label: "Completed",
      count: tasks.filter((t) => t.status === "done").length,
    },
  ];

  // Handle active view changes and navigate to the route
  const handleActiveViewChange = (view: string) => {
    if (view === "inbox") {
      navigate("/");
    } else {
      navigate(`/${view}`);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Nirvana GTD</h1>
      </div>
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleActiveViewChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-colors ${
                location.pathname === "/" && item.id === "inbox"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : location.pathname === `/${item.id}`
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{item.label}</span>
              {item.count > 0 && (
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          {/* Projects Navigation */}
          <div className="pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={() => navigate("/projects")}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors ${
                location.pathname === "/projects"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Projects</span>
            </button>
          </div>
        </div>
      </nav>
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
