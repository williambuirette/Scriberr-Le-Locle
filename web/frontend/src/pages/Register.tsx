import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ScriberrLogo } from "../components/ScriberrLogo";
import { useRouter } from "../contexts/RouterContext";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface RegisterProps {
	onRegister: (token: string) => void;
}

interface PasswordStrength {
	hasMinLength: boolean;
	hasUppercase: boolean;
	hasLowercase: boolean;
	hasNumber: boolean;
	hasSpecialChar: boolean;
}

export function Register({ onRegister }: RegisterProps) {
    const { navigate } = useRouter();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Password strength validation
	const checkPasswordStrength = (pwd: string): PasswordStrength => ({
		hasMinLength: pwd.length >= 8,
		hasUppercase: /[A-Z]/.test(pwd),
		hasLowercase: /[a-z]/.test(pwd),
		hasNumber: /\d/.test(pwd),
		hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
	});

	const passwordStrength = checkPasswordStrength(password);
	const isPasswordValid = Object.values(passwordStrength).every(Boolean);
	const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!isPasswordValid) {
			setError("Please ensure your password meets all requirements");
			return;
		}

		if (!passwordsMatch) {
			setError("Passwords do not match");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/v1/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					password,
					confirmPassword,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				onRegister(data.token);
			} else {
				const error = await response.json();
				setError(error.error || "Registration failed");
			}
		} catch (error) {
			console.error("Registration error:", error);
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const PasswordStrengthIndicator = ({ label, met }: { label: string; met: boolean }) => (
		<div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
			{met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
			<span>{label}</span>
		</div>
	);

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
						Welcome to Scriberr
					</h2>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Create your admin account to get started
					</p>
				</div>

				<Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
					<CardHeader>
						<CardTitle className="text-gray-900 dark:text-gray-100">Setup Admin Account</CardTitle>
						<CardDescription className="text-gray-600 dark:text-gray-400">
							This will be the only account that can access this Scriberr instance
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
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
									placeholder="Choose a username (3-50 characters)"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									disabled={loading}
									required
									minLength={3}
									maxLength={50}
									className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
								/>
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
									Password
								</Label>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="Create a secure password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										disabled={loading}
										required
										className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 pr-10"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								
								{password && (
									<div className="mt-3 space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
										<p className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Requirements:</p>
										<div className="grid grid-cols-1 gap-1">
											<PasswordStrengthIndicator label="At least 8 characters" met={passwordStrength.hasMinLength} />
											<PasswordStrengthIndicator label="One uppercase letter" met={passwordStrength.hasUppercase} />
											<PasswordStrengthIndicator label="One lowercase letter" met={passwordStrength.hasLowercase} />
											<PasswordStrengthIndicator label="One number" met={passwordStrength.hasNumber} />
											<PasswordStrengthIndicator label="One special character" met={passwordStrength.hasSpecialChar} />
										</div>
									</div>
								)}
							</div>
							
							<div className="space-y-2">
								<Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
									Confirm Password
								</Label>
								<div className="relative">
									<Input
										id="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										placeholder="Confirm your password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										disabled={loading}
										required
										className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 pr-10 ${
											confirmPassword && !passwordsMatch ? 'border-red-300 dark:border-red-600' : ''
										}`}
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
									>
										{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</button>
								</div>
								
								{confirmPassword && (
									<div className={`flex items-center gap-2 text-sm ${
										passwordsMatch ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
									}`}>
										{passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
										<span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
									</div>
								)}
							</div>
							
							<Button
								type="submit"
								className="w-full bg-blue-600 hover:bg-blue-700 text-white"
								disabled={loading || !username.trim() || !isPasswordValid || !passwordsMatch}
							>
								{loading ? "Creating Account..." : "Create Admin Account"}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="text-center">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						This account will have full administrative access to your Scriberr instance
					</p>
				</div>
			</div>
		</div>
	);
}
