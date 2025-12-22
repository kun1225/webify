import { CoursesMain } from './_components/courses-main';

export default function Page() {
	return (
		<section className="px-edge py-section space-y-16">
			<header className="space-y-8 text-center">
				<h1 className="t-heading-1 text-primary text-shadow-md">所有課程</h1>
				<p className="t-body-1 text-muted-foreground mx-auto max-w-xl text-pretty">
					探索我們精心挑選的網頁開發課程，從基礎到進階，幫助你掌握最新技術與實戰經驗
				</p>
			</header>

			<CoursesMain />
		</section>
	);
}
