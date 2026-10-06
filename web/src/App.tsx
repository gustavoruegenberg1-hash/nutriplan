import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { DietPlanner } from './pages/DietPlanner';
import { WorkoutPlanner } from './pages/WorkoutPlanner';
import { FoodCatalog } from './pages/FoodCatalog';
import { ExerciseCatalog } from './pages/ExerciseCatalog';
import { WorkoutHistory } from './pages/WorkoutHistory';
import { Evolution } from './pages/Evolution';
import { Profile } from './pages/Profile';

const AppLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rotas Protegidas Autenticadas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/diet" element={<DietPlanner />} />
              <Route path="/workouts" element={<WorkoutPlanner />} />
              <Route path="/foods" element={<FoodCatalog />} />
              <Route path="/exercises" element={<ExerciseCatalog />} />
              <Route path="/history" element={<WorkoutHistory />} />
              <Route path="/evolution" element={<Evolution />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
