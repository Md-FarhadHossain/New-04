"use client";
import { AdminProvider } from "./context/AdminContext";
import FacebookPixel from "../components/FacebookPixel";
import { Suspense } from 'react';

export function Providers({ children }) {
  return (
    <AdminProvider>
        <Suspense fallback={null}>
            <FacebookPixel />
        </Suspense>
        {children}
    </AdminProvider>
  );
}
