import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Orbit } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
	return (
		<section className="px-edge flex min-h-screen flex-col-reverse items-center justify-center gap-16 pt-26 pb-12 lg:flex-row lg:gap-32">
			<HomeContent />
			<HomeVisual />
		</section>
	);
}

function HomeContent() {
	return (
		<div className="space-y-8 text-center lg:text-left">
			<p className="text-primary border-primary/20 bg-primary/5 mx-auto w-fit rounded-full border px-4 py-2 text-sm font-medium tracking-wider lg:mx-0">
				Webify - 專業網頁開發課程平台
			</p>

			<h1 className="text-foreground font-serif text-5xl leading-[1.2] font-bold lg:text-6xl">
				<span className="text-shadow-md">成為網頁開發大師</span>
				<br />
				<span className="from-primary to-accent text-shadow-primary/20 bg-linear-to-br bg-clip-text text-transparent text-shadow-md">
					從這裡開始
				</span>
			</h1>

			<p className="text-muted-foreground max-w-2xl text-xl leading-[1.5]">
				專為網頁開發學習者打造的課程平台，匯集業界頂尖創作者的實戰經驗。無論你是初學者想要入門，還是資深開發者想要精進技能，我們都有適合你的課程。
			</p>

			<div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
				<Button asChild size="lg" className="group relative">
					<Link href="courses">
						<span className="relative z-10">立即探索課程</span>
						<ArrowRight className="relative z-10 transition-transform group-hover:translate-x-1" />

						{/* Primary Button Background */}
						<div className="from-primary to-accent absolute inset-0 bg-linear-to-r transition-opacity group-hover:opacity-0"></div>
					</Link>
				</Button>

				<Button asChild variant="outline" size="lg" className="group">
					<Link href="pricing">
						<span>查看定價方案</span>
						<Zap className="transition-transform group-hover:rotate-15" />
					</Link>
				</Button>
			</div>
		</div>
	);
}

function HomeVisual() {
	return (
		<div className="bg-primary/2 border-primary/20 shadow-primary/10 relative flex size-64 items-center justify-center rounded-2xl border p-8 shadow-lg md:size-72 lg:size-96">
			{/* Internal glow */}
			<div className="from-primary/15 to-opacity animation-duration-3000 absolute inset-6 animate-pulse rounded-2xl bg-radial blur-xl" />

			<div className="relative flex items-center justify-center">
				{/* Rotating ring */}
				<div className="border-primary/30 animation-duration-10000 absolute inset-0 animate-spin rounded-full border-2 border-dashed" />

				<div className="text-primary relative animate-pulse rounded-2xl bg-linear-to-br p-12 lg:p-16">
					<Orbit className="size-20 drop-shadow-md lg:size-28" />
				</div>
			</div>

			{/* decoration points */}
			<div className="bg-primary animation-duration-2000 absolute top-4 right-4 size-2 animate-ping rounded-full" />
		</div>
	);
}
