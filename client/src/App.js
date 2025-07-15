// src/App.js
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Home from "./pages/home";

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />}/>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* 404 fallback */}
            <Route
              path="*"
              element={<div className="text-center text-lg">Not Found</div>}
            />
          </Routes>
          {/* If using Outlet-based nested routes:
              <Outlet />  */}
    </div>
  );
}
