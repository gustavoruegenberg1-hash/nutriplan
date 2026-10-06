import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { RegisterProfessional } from './pages/RegisterProfessional';
import { Dashboard } from './pages/Dashboard';
import { DietPlanner } from './pages/DietPlanner';
import { WorkoutPlanner } from './pages/WorkoutPlanner';
import { Profile } from './pages/Profile';
import { ProfessionalDashboard } from './pages/ProfessionalDashboard';
import { ProfessionalClients } from './pages/ProfessionalClients';
import { AdminDashboard } from './pages/AdminDashboard';

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
          <Route path="/register-professional" element={<RegisterProfessional />} />

          {/* Rotas Protegidas Autenticadas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Rotas do Usuário Comum */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/diet" element={<DietPlanner />} />
              <Route path="/workouts" element={<WorkoutPlanner />} />
              <Route path="/profile" element={<Profile />} />

              {/* Redirecionamentos semânticos retrocompatíveis para as abas condensadas */}
              <Route path="/foods" element={<Navigate to="/diet?tab=taco" replace />} />
              <Route path="/exercises" element={<Navigate to="/workouts?tab=exercises" replace />} />
              <Route path="/history" element={<Navigate to="/workouts?tab=history" replace />} />
              <Route path="/evolution" element={<Navigate to="/profile?tab=evolution" replace />} />

              {/* Rotas de Profissionais */}
              <Route
                path="/professional"
                element={<ProfessionalDashboard />}
              />
              <Route
                path="/professional/clients"
                element={<ProfessionalClients />}
              />

              {/* Rotas de Administrador */}
              <Route
                path="/admin"
                element={<AdminDashboard />}
              />
              <Route
                path="/admin/professionals"
                element={<AdminDashboard />}
              />
              <Route
                path="/admin/users"
                element={<AdminDashboard />}
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
