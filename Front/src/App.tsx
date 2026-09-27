import { Route, Routes } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import "./App.css";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import AdminRoute from "./Components/AdminRoute";
import ProtectedRoute from "./Components/ProtectedRoute";
import SignUpModal from "./Modals/SignUpModal";
import SignInModals from "./Modals/SignInModals";
import Home from "./Pages/Home";
import Plans from "./Pages/Plans";
import OpenPlan from "./Pages/OpenPlan";
import Admin from "./Pages/Admin";
import { useCurrentUser } from "./API/useAuthQueries";
import { resetUser, setUser } from "./Utils/usePlanerStore";

const queryClient = new QueryClient();

function AuthSync() {
  const { data: user } = useCurrentUser();

  useEffect(() => {
    // Undefined means the session request has not resolved yet.
    if (user === undefined) return;

    if (user === null) {
      resetUser();
    } else {
      setUser(user);
    }
  }, [user]);

  return null;
}

function PageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center gap-3 py-20">
      <span className="loading loading-spinner text-primary" />Loading...
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <div className="flex min-h-dvh flex-col bg-base-100">
        <Navbar />
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/plans"
              element={<ProtectedRoute> <Plans /> </ProtectedRoute>}
            />
            <Route
              path="/openPlan"
              element={<ProtectedRoute> <OpenPlan /> </ProtectedRoute>}
            />
            <Route
              path="/admin/plans"
              element={
                <ProtectedRoute>
                  <AdminRoute><Admin /></AdminRoute>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
        <Footer />
        <SignUpModal />
        <SignInModals />
        <Toaster
          position="top-center"
          richColors={true}
          theme="dark"
          offset={70}
          toastOptions={{
            classNames: {
              toast: "!bg-slate-900/90 !border !border-slate-700 !font-extrabold !text-lg !justify-center !text-center",
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}
