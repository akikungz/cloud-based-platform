"use client";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import HomeIcon from "@mui/icons-material/Home";
import { Button, Stack } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const NotFound: React.FC = () => {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center w-full h-screen bg-gray-100">
			<div className="max-w-md w-full p-6 rounded-lg">
				<Image
					src="/Icon.png"
					alt="Midori Logo"
					width={704}
					height={252}
					className="mx-auto mb-4"
					priority
				/>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-gray-500 text-2xl">404</span>
				<span className="text-gray-400">|</span>
				<h1 className="text-2xl text-gray-800">Page Not Found</h1>
			</div>
			<p className="text-gray-600 mt-2">
				The page you are looking for does not exist.
			</p>

			<Stack direction="row" spacing={2} className="mt-4" justifyItems="center">
				<Button
					variant="outlined"
					color="primary"
					className="mt-4"
					startIcon={<ArrowBackIosIcon />}
					onClick={() => router.back()}
				>
					Go Back
				</Button>

				<Link href="/" passHref>
					<Button
						variant="contained"
						color="primary"
						startIcon={<HomeIcon />}
					>
						Home
					</Button>
				</Link>
			</Stack>
		</div>
	);
};

export default NotFound;
