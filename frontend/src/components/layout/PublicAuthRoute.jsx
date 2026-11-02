import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * PublicAuthRoute Component
 * Renders public authentication pages (/login, /register) cleanly.
 */
export default function PublicAuthRoute({ children }) {
  return children || <Outlet />;
}
