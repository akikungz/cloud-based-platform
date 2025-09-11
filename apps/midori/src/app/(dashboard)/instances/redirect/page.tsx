"use client";
import { UserContext } from "@midori/contexts/user";
import { Role } from "auth/utils/role";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InstancesRedirectPage() {
	const { user, isPending } = useContext(UserContext);
	const router = useRouter();

	useEffect(() => {
		if (isPending) return;

		if (!user) {
			router.push("/sign-in");
			return;
		}

		// Redirect based on user role
		if (user.role === Role.Student) {
			router.push("/instances/student");
		} else if (user.role === Role.Staff) {
			router.push("/instances");
		} else {
			router.push("/dashboard");
		}
	}, [user, isPending, router]);

	// Show loading while redirecting
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vm-blue-500"></div>
		</div>
	);
}
