"use client";

export default function SettingsPage() {
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			{/* Header */}
			<div className="flex flex-col w-full px-2 pt-2">
				<h2 className="text-3xl font-semibold">Settings</h2>
				<p className="text-vm-blue-600">
					Manage your account settings and preferences.
				</p>
			</div>

			{/* Placeholder Content */}
			<div className="w-full bg-white p-8 rounded-lg shadow-md text-center">
				<h3 className="text-xl font-semibold text-vm-blue-900 mb-4">
					Settings Panel
				</h3>
				<p className="text-vm-blue-600">
					This page will contain the settings interface.
				</p>
			</div>
		</div>
	);
}
