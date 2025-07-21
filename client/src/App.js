// src/App.js
import React, { useState } from "react";
import { Routes, Route, Link, Outlet, Navigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/regis";
import HomePage from "./pages/home";

export default function App() {
  /* sidebar state */
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen((prev) => !prev);

  return (
    <div className="fixed flex h-screen w-screen overflow-hidden">
      <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<HomePage />}/>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
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
