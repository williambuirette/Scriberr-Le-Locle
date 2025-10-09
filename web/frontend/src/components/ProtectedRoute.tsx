import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";

interface ProtectedRouteProps {
	children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, requiresRegistration, isInitialized, login } = useAuth();

	// Show loading while initializing
	if (!isInitialized) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	// Show registration form if no users exist
	if (requiresRegistration) {
		return <Register onRegister={login} />;
	}

	// Show login form if not authenticated
	if (!isAuthenticated) {
		return <Login onLogin={login} />;
	}

	// Show protected content if authenticated
	return <>{children}</>;
}