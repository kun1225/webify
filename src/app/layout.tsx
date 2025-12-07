import type { Metadata } from 'next';
import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google';

import '../styles/globals.css';

const notoSansTC = Noto_Sans_TC({
	variable: '--font-noto-sans-tc',
	subsets: ['latin'],
});

const notoSerifTC = Noto_Serif_TC({
	variable: '--font-noto-serif-tc',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Webify',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${notoSansTC.variable} ${notoSerifTC.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
