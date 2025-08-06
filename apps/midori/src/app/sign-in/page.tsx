"use client";
import { authClient } from "@midori/libs/auth";
import { env } from "@midori/libs/env";
import { cn } from "@midori/utils/format";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	Snackbar,
	TextField,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { studentValidationFromId } from "utils";

export default function SignIn() {
	const searchParams = useSearchParams();
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [studentId, setStudentId] = useState("");

	const isStudentIdValid = studentValidationFromId(studentId);

	const handleSignIn = async () => {
		const signin = await authClient.signIn.social({
			provider: "google",
			callbackURL: `${env.FRONTEND_BASE_URL}/dashboard`,
		});

		console.log("Sign-in response:", signin);

		if (signin.error) {
			console.error("Sign-in error:", signin.error);
			return;
		}
	};

	const handleCloseModal = () => setIsModalOpen(false);
	const handleOpenModal = () => setIsModalOpen(true);

	useEffect(() => {
		if (searchParams) {
			const error = searchParams.get("error");
			if (error) {
				setError("An error occurred during sign-in. Please try again.");
			}
		}
	}, [searchParams]);

	return (
		<div className="w-full min-h-dvh flex items-center justify-center relative p-4 bg-gradient-accent">
			{error && (
				<Snackbar
					open={!!error}
					autoHideDuration={6000}
					onClose={() => setError(null)}
					message={error}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
					color="error"
				/>
			)}

			<Dialog open={isModalOpen} onClose={handleCloseModal}>
				<DialogTitle className="text-center text-lg font-semibold">
					Authorized Users Only
				</DialogTitle>
				<DialogContent>
					<div className="flex flex-col gap-4">
						<div className="p-4 bg-vm-orange-100 flex flex-col gap-2 rounded-lg">
							<h2 className="font-bold text-vm-orange-600 text-left">Staff</h2>
							<p className="text-sm text-gray-700">
								Staff member from the Department of Information Technology,
								Faculty of Industrial Technology and Management, King Mongkut's
								University of Technology North Bangkok.
							</p>
							<a
								href="http://202.44.47.45/fitm/personnel?board_id=3"
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-blue-500 hover:underline"
							>
								Staff members
							</a>
						</div>

						<div className="p-4 bg-vm-blue-100 flex flex-col gap-2 rounded-lg">
							<h2 className="font-bold text-vm-blue-600 text-left">Students</h2>

							<p className="text-sm text-gray-700">
								Students from the Department of Information Technology, Faculty
								of Industrial Technology and Management, King Mongkut's
								University of Technology North Bangkok.
							</p>

							<div className="bg-white p-2 rounded-xl shadow-sm">
								<TextField
									label="Check access with Student ID"
									variant="outlined"
									fullWidth
									placeholder="KMUTNB Student ID"
									size="small"
									slotProps={{
										input: {
											startAdornment: isStudentIdValid ? (
												<CheckIcon className="text-green-500 mr-1" />
											) : (
												<CloseIcon className="text-red-500 mr-1" />
											),
										},
									}}
									onChange={(e) => setStudentId(e.target.value)}
									value={studentId}
								/>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<div className="bg-vm-blue-100 p-8 rounded-lg shadow-lg max-w-lg w-full">
				<h1 className="text-3xl font-bold text-center mb-4 text-vm-orange-600">
					Welcome Back
				</h1>

				<p className="text-center mb-4">
					Sign in to your account to access the dashboard and manage your
					instance of virtual machines.
				</p>

				<button
					type="button"
					className={cn(
						"w-full px-4 py-2 bg-white text-black border-2 border-white transition-all",
						"flex items-center justify-between rounded-full cursor-pointer",
						"hover:border-kmutnb-500 focus:outline-none",
					)}
					onClick={handleSignIn}
				>
					{/* <GoogleIcon /> */}
					<Image
						src="/google_logo.svg"
						alt="Google Icon"
						width={24}
						height={24}
						className="mr-2"
					/>
					<span className="font-semibold">
						Sign In with Google
						<span className="hidden sm:inline"> (@email.kmutnb.ac.th)</span>
					</span>
					<div />
				</button>

				<div className="mt-4 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-1 flex-wrap">
					<p>
						Access to this application is restricted to{" "}
						<button
							type="button"
							className="text-blue-500 hover:underline hover:cursor-pointer"
							onClick={handleOpenModal}
						>
							authorized users
						</button>{" "}
						only.
					</p>
					<p>
						By signing in, you agree to the{" "}
						<Link href="/terms" className="text-blue-500 hover:underline">
							Terms of Service
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
