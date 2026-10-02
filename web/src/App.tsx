import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { Dashboard } from './pages/Dashboard';
import { DietPlanner } from './pages/DietPlanner';
import { NutrientInfo } from './pages/NutrientInfo';
import { WorkoutPlanner } from './pages/WorkoutPlanner';
import { Articles } from './pages/Articles';
import { ArticleDetail } from './pages/ArticleDetail';
import { Profile } from './pages/Profile';
import { IdleGameScreen } from './pages/IdleGameScreen';
import { ProfessionalsList } from './pages/ProfessionalsList';
import { ProfessionalDetail } from './pages/ProfessionalDetail';
import { ChatScreen } from './pages/ChatScreen';
import { WaterReminderModal } from './components/water/WaterReminderModal';
import { waterReminderService } from './services/waterReminderService';
import { useAuth } from './contexts/AuthContext';

function WaterReminderWatcher() {
  const { user, isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkReminder = () => {
      if (waterReminderService.shouldRemind(user.id)) {
        waterReminderService.sendNativeNotification(
          '💧 Hora de Beber Água! - NutriPlan',
          'Mantenha seu corpo hidratado para otimizar o metabolismo e a recuperação muscular.'
        );
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  return null;
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <WaterReminderWatcher />
        <div className="min-h-screen bg-canvas flex flex-col justify-between text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="flex-1 pb-20 md:pb-12 pt-1 md:pt-0">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/articles/:id" element={<ArticleDetail />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/jogo" element={<IdleGameScreen />} />
                  <Route path="/mascote" element={<Navigate to="/jogo?tab=mascote" replace />} />
                  <Route path="/diet" element={<DietPlanner />} />
                  <Route path="/diet/info" element={<NutrientInfo />} />
                  <Route path="/diet/info/:nutrient" element={<NutrientInfo />} />
                  <Route path="/workout" element={<WorkoutPlanner />} />
                  <Route path="/professionals" element={<ProfessionalsList />} />
                  <Route path="/professionals/:id" element={<ProfessionalDetail />} />
                  <Route path="/chat" element={<ChatScreen />} />
                  <Route path="/chat/:conversationId" element={<ChatScreen />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Barra de Navegação Inferior Nativa para Mobile */}
          <BottomNav />

          {/* Footer visível no Desktop */}
          <footer className="hidden md:block border-t border-surface-border bg-canvas/90 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4">
              <p>
                NutriPlan &copy; {new Date().getFullYear()} &middot; Aplicativo de Nutrição, Treino e Ciência.
              </p>
              <p className="mt-1 text-slate-600">
                Tabela TACO (UNICAMP) &middot; Equações de Mifflin-St Jeor &middot; Base de Artigos Indexados (PubMed/DOI)
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
