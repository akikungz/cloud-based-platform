"use client";
import { PageHeader, SectionCard } from "@midori/components/ui";

export default function SettingsPage() {
	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<PageHeader
				title="Settings"
				description="Manage your account settings and preferences."
			/>

			{/* Placeholder Content */}
			<SectionCard title="Settings Panel">
				<div className="text-center py-8">
					<p className="text-vm-blue-600">
						This page will contain the settings interface.
					</p>
				</div>
			</SectionCard>
		</div>
	);
}
