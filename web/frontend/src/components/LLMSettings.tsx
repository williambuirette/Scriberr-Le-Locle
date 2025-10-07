import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Bot, Key, Globe, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface LLMConfig {
	id?: number;
	provider: string;
	base_url?: string;
	has_api_key?: boolean;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export function LLMSettings() {
	const [config, setConfig] = useState<LLMConfig>({
		provider: "ollama",
		is_active: false,
	});
	const [baseUrl, setBaseUrl] = useState("");
	const [apiKey, setApiKey] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
	const { getAuthHeaders } = useAuth();

	useEffect(() => {
		fetchConfig();
	}, []);

	const fetchConfig = async () => {
		try {
			const response = await fetch("/api/v1/llm/config", {
				headers: getAuthHeaders(),
			});

			if (response.ok) {
				const data = await response.json();
				setConfig(data);
				setBaseUrl(data.base_url || "");
				// Don't set API key from response for security
			} else if (response.status !== 404) {
				console.error("Failed to fetch LLM config");
			}
		} catch (error) {
			console.error("Error fetching LLM config:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		setSaving(true);
		setMessage(null);

		const payload = {
			provider: config.provider,
			is_active: true, // Always set to active when saving
			...(config.provider === "ollama" && { base_url: baseUrl }),
			...(config.provider === "openai" && { api_key: apiKey }),
		};

		try {
			const response = await fetch("/api/v1/llm/config", {
				method: "POST",
				headers: {
					...getAuthHeaders(),
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (response.ok) {
				const data = await response.json();
				setConfig(data);
				setMessage({ type: "success", text: "LLM configuration saved successfully!" });
				// Clear the API key field after saving
				if (config.provider === "openai") {
					setApiKey("");
				}
			} else {
				const errorData = await response.json();
				setMessage({ type: "error", text: errorData.error || "Failed to save configuration" });
			}
		} catch (error) {
			console.error("Error saving LLM config:", error);
			setMessage({ type: "error", text: "Failed to save configuration. Please try again." });
		} finally {
			setSaving(false);
		}
	};

	const isFormValid = () => {
		if (config.provider === "ollama") {
			return baseUrl.trim() !== "";
		}
		if (config.provider === "openai") {
			return apiKey.trim() !== "" || config.has_api_key;
		}
		return false;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-32">
				<div className="text-gray-500 dark:text-gray-400">Loading LLM configuration...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6">
				<div className="mb-4 sm:mb-6">
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
						<Bot className="h-5 w-5" />
						LLM Configuration
					</h3>
					<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
						Configure external Large Language Model integration for enhanced features.
					</p>
				</div>

				{message && (
					<div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-center gap-2 ${
						message.type === "success" 
							? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200" 
							: "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
					}`}>
						{message.type === "success" ? (
							<CheckCircle className="h-4 w-4" />
						) : (
							<AlertCircle className="h-4 w-4" />
						)}
						{message.text}
					</div>
				)}

				<div className="space-y-6">
					{/* Provider Selection */}
					<div>
						<Label className="text-base font-medium">Choose LLM Provider</Label>
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
							Select the LLM service you want to integrate with
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<label htmlFor="ollama">
								<Card className={`cursor-pointer transition-colors ${
									config.provider === "ollama" 
										? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
										: "hover:bg-gray-50 dark:hover:bg-gray-600"
								}`}>
									<CardHeader className="pb-2">
										<div className="flex items-center space-x-2">
											<input
												type="radio"
												id="ollama"
												name="provider"
												value="ollama"
												checked={config.provider === "ollama"}
												onChange={(e) => setConfig({ ...config, provider: e.target.value })}
												className="h-4 w-4 text-blue-600 focus:ring-blue-500"
											/>
											<Bot className="h-5 w-5" />
											<CardTitle className="text-base">Ollama</CardTitle>
										</div>
									</CardHeader>
									<CardContent>
										<CardDescription>
											Local LLM server. Requires Ollama installation.
										</CardDescription>
									</CardContent>
								</Card>
							</label>

							<label htmlFor="openai">
								<Card className={`cursor-pointer transition-colors ${
									config.provider === "openai" 
										? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
										: "hover:bg-gray-50 dark:hover:bg-gray-600"
								}`}>
									<CardHeader className="pb-2">
										<div className="flex items-center space-x-2">
											<input
												type="radio"
												id="openai"
												name="provider"
												value="openai"
												checked={config.provider === "openai"}
												onChange={(e) => setConfig({ ...config, provider: e.target.value })}
												className="h-4 w-4 text-blue-600 focus:ring-blue-500"
											/>
											<Globe className="h-5 w-5" />
											<CardTitle className="text-base">OpenAI</CardTitle>
										</div>
									</CardHeader>
									<CardContent>
										<CardDescription>
											OpenAI's cloud API. Requires API key.
										</CardDescription>
									</CardContent>
								</Card>
							</label>
						</div>
					</div>

					{/* Configuration Fields */}
					<div className="space-y-4">
						{config.provider === "ollama" && (
							<div>
								<Label htmlFor="baseUrl">Ollama Base URL *</Label>
								<Input
									id="baseUrl"
									type="url"
									placeholder="http://localhost:11434"
									value={baseUrl}
									onChange={(e) => setBaseUrl(e.target.value)}
									className="mt-1"
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									The URL where your Ollama server is running
								</p>
							</div>
						)}

						{config.provider === "openai" && (
							<div>
								<Label htmlFor="apiKey" className="flex items-center gap-2">
									<Key className="h-4 w-4" />
									OpenAI API Key *
									{config.has_api_key && (
										<span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
											Already configured
										</span>
									)}
								</Label>
								<Input
									id="apiKey"
									type="password"
									placeholder={config.has_api_key ? "Enter new API key to update" : "sk-..."}
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
									className="mt-1"
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Your OpenAI API key. {config.has_api_key ? "Leave blank to keep current key." : ""}
								</p>
							</div>
						)}
					</div>

					{/* Status */}
					{config.id && (
						<div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
							<h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Status</h4>
							<div className="flex items-center gap-2">
								{config.is_active ? (
									<>
										<CheckCircle className="h-4 w-4 text-green-600" />
										<span className="text-sm text-green-700 dark:text-green-300">
											Active configuration for {config.provider}
										</span>
									</>
								) : (
									<>
										<AlertCircle className="h-4 w-4 text-yellow-600" />
										<span className="text-sm text-yellow-700 dark:text-yellow-300">
											Configuration saved but not active
										</span>
									</>
								)}
							</div>
						</div>
					)}

					{/* Save Button */}
					<div className="flex justify-end">
						<Button
							onClick={handleSave}
							disabled={!isFormValid() || saving}
							className="bg-blue-600 hover:bg-blue-700 text-white"
						>
							{saving ? "Saving..." : "Save Configuration"}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
