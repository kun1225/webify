import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function AboutPage() {
	return (
		<section className="px-edge py-section space-y-16">
			<header className="mb-32 space-y-8 text-center">
				<p className="text-muted-foreground mb-0 text-xs leading-[1.8] tracking-widest uppercase">
					Webify
				</p>
				<h1 className="text-primary font-serif text-5xl leading-[1.5] font-bold text-shadow-md lg:text-6xl">
					關於我們
				</h1>
				<p className="text-muted-foreground mx-auto max-w-xl text-xl leading-[1.4] text-pretty">
					Webify 是專為網頁開發領域打造的課程平台，協助創作者安全銷售內容，
					也讓學習者輕鬆探索、購買並持續精進。
				</p>
			</header>

			<article className="flex flex-col justify-center gap-4 text-center md:flex-row md:gap-8 md:text-left">
				<div className="relative mx-auto aspect-square w-full max-w-xs md:mx-0 md:w-1/4">
					<Image
						src="/idea.webp"
						alt="創作理念"
						fill
						className="object-cover"
					/>
				</div>

				<div className="flex flex-col justify-center gap-8">
					<h2 className="text-foreground font-serif text-4xl leading-[1.3] font-bold">
						創作理念
					</h2>
					<p className="text-muted-foreground max-w-3xl text-base leading-[1.5] text-pretty">
						我們相信只要提供直覺的創作工具與彈性的商業機制，任何人都能成為創作者。
						Webify
						讓使用者透過升級即可解鎖創作者身份，並在一個介面中完成課程建立、
						內容管理與發布，縮短從靈感到上架的距離。
					</p>
				</div>
			</article>

			<article className="flex flex-col justify-center gap-4 text-center md:flex-row-reverse md:gap-8 md:text-left">
				<div className="relative mx-auto aspect-square w-full max-w-xs md:mx-0 md:w-1/4">
					<Image
						src="/vision.webp"
						alt="承諾與願景"
						fill
						className="object-cover"
					/>
				</div>

				<div className="flex flex-col justify-center gap-8">
					<h2 className="text-foreground font-serif text-4xl leading-[1.3] font-bold">
						承諾與願景
					</h2>
					<p className="text-muted-foreground max-w-3xl text-base leading-[1.5] text-pretty">
						我們致力於打造安全而可擴充的學習體驗：嚴謹的身份與權限控管、私有媒體簽署、
						以及穩定的串流品質，確保課程在任何時候都能可靠地傳遞給真正需要的人。
						長遠而言，Webify 期望成為華語世界最值得信賴的網頁開發知識基地。
					</p>
				</div>
			</article>

			<div className="flex justify-center">
				<Button size="lg" asChild>
					<Link href="/my-courses">立即體驗</Link>
				</Button>
			</div>
		</section>
	);
}
