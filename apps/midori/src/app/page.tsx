"use client";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Button, Chip } from "@mui/material";
import { GraduationCap, Server, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-gradient-accent flex flex-col">
			{/* Hero Section */}
			<div className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
				<div className="relative max-w-7xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center justify-center text-center">
					<div className="text-center flex flex-col items-center">
						<div className="mb-4">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-6 shadow-strong">
								<Server className="w-8 h-8 text-white" />
							</div>
							<h1 className="text-5xl font-bold text-vm-blue-900 mb-4">
								VM Platform
							</h1>
							<p className="text-xl text-vm-blue-700 max-w-2xl mx-auto">
								Cluster-Based Platform for Supporting Teaching and Academic
								Activities in the Department of Information Technology
							</p>
						</div>

						<div className="grid grid-cols-1 gap-2 mb-4 max-w-xl lg:max-w-2xl">
							<a
								href="https://www.kmutnb.ac.th"
								target="_blank"
								rel="noopener noreferrer"
								className="col-span-1 md:col-span-2"
							>
								<Chip
									label="King Mongkut's University of Technology North Bangkok"
									color="secondary"
									variant="outlined"
								/>
							</a>
							<a
								href="https://fitm.kmutnb.ac.th"
								target="_blank"
								rel="noopener noreferrer"
								className="col-span-1"
							>
								<Chip
									label="Faculty of Industrial Technology and Management"
									color="primary"
									variant="outlined"
								/>
							</a>
							<a
								href="https://sites.google.com/itm.kmutnb.ac.th/it-fitm"
								target="_blank"
								rel="noopener noreferrer"
								className="col-span-1"
							>
								<Chip
									label="Department of Information Technology"
									color="primary"
									variant="outlined"
								/>
							</a>
						</div>

						<div className="flex flex-col justify-center items-center gap-4 max-w-2xl mx-auto">
							<p className="text-vm-blue-600">
								If you are a student of the Department of Information Technology
								or a department member, please log in with your university email
								to access the platform.
							</p>

							{/* Go to dashboard */}
							<Link href="/dashboard">
								<Button
									variant="contained"
									color="primary"
									size="large"
									className="px-8 py-4 text-lg font-semibold"
									endIcon={<ArrowForwardIcon className="w-4 h-4" />}
								>
									Go to Dashboard
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-8 bg-vm-orange-50/50">
				<div className="max-w-7xl mx-auto px-6">
					<h2 className="text-3xl font-bold text-vm-blue-900 text-center mb-12">
						Platform Features
					</h2>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="w-12 h-12 bg-gradient-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
								<Server className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-lg font-semibold text-vm-blue-900 mb-2">
								VM Management
							</h3>
							<p className="text-vm-blue-600">
								Create, manage, and monitor Linux virtual machines with ease
							</p>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-gradient-secondary rounded-lg mx-auto mb-4 flex items-center justify-center">
								<Users className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-lg font-semibold text-vm-blue-900 mb-2">
								Multi-User Support
							</h3>
							<p className="text-vm-blue-600">
								Support for both students and faculty with role-based access
							</p>
						</div>
						<div className="text-center">
							<div className="w-12 h-12 bg-vm-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
								<Shield className="w-6 h-6 text-white" />
							</div>
							<h3 className="text-lg font-semibold text-vm-blue-900 mb-2">
								Secure Access
							</h3>
							<p className="text-vm-blue-600">
								Google OAuth integration with domain verification
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Services Section */}
			<div className="py-8 bg-vm-blue-50/50">
				<div className="max-w-7xl mx-auto px-6">
					<h2 className="text-3xl font-bold text-vm-blue-900 text-center mb-12">
						Our Services
					</h2>
					<div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
						<div className="text-center">
							<GraduationCap className="w-12 h-12 text-vm-blue-600 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-vm-blue-900 mb-2">
								Educational Support
							</h3>
							<p className="text-vm-blue-600">
								Providing virtual machines for academic projects and research
							</p>
						</div>
						<div className="text-center">
							<Server className="w-12 h-12 text-vm-blue-600 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-vm-blue-900 mb-2">
								Resource Management
							</h3>
							<p className="text-vm-blue-600">
								Efficient management of virtual resources for students and teachers
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="flex-1" />

			{/* Footer */}
			<footer className="py-6 bg-vm-blue-50/50 w-full">
				<div className="max-w-7xl mx-auto px-6">
					<p className="text-center text-sm text-gray-600">
						This platform is for educational purposes only. Unauthorized use is
						prohibited.
					</p>
				</div>
			</footer>
		</div>
	);
}
