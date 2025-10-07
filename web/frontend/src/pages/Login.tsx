import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ScriberrLogo } from "../components/ScriberrLogo";
import { useRouter } from "../contexts/RouterContext";
import { ThemeSwitcher } from "../components/ThemeSwitcher";

interface LoginProps {
	onLogin: (token: string) => void;
}

export function Login({ onLogin }: LoginProps) {
    const { navigate } = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await fetch("/api/v1/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					password,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				onLogin(data.token);
			} else {
				const error = await response.json();
				setError(error.error || "Login failed");
			}
		} catch (error) {
			console.error("Login error:", error);
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
			<div className="absolute top-8 right-8">
				<ThemeSwitcher />
			</div>
			
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
                <div className="flex justify-center mb-6">
                    <ScriberrLogo onClick={() => navigate({ path: 'home' })} />
                </div>
					<h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						Sign in to Scriberr
					</h2>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Access your audio transcription workspace
					</p>
				</div>

				<Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
					<CardHeader>
						<CardTitle className="text-gray-900 dark:text-gray-100">Login</CardTitle>
						<CardDescription className="text-gray-600 dark:text-gray-400">
							Enter your credentials to continue
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-4">
							{error && (
								<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
									<p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
								</div>
							)}
							
							<div className="space-y-2">
								<Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
									Username
								</Label>
								<Input
									id="username"
									type="text"
									placeholder="Enter your username"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									disabled={loading}
									required
									className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
								/>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
									Password
								</Label>
								<Input
									id="password"
									type="password"
									placeholder="Enter your password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={loading}
									required
									className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
								/>
							</div>
							
							<Button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 text-white"
								disabled={loading || !username.trim() || !password.trim()}
							>
								{loading ? "Signing in..." : "Sign In"}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="text-center">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Secure authentication required for API key management
					</p>
				</div>
			</div>
		</div>
	);
}
