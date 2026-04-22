import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormButton } from '@/components/form-button';

const planFeatures = [
	{
		label: '瀏覽所有公開課程',
		free: true,
		lifetime: true,
	},
	{
		label: '收藏課程與追蹤創作者',
		free: true,
		lifetime: true,
	},
	{
		label: '加入討論與完成學習紀錄',
		free: true,
		lifetime: true,
	},
	{
		label: '創作並上架課程',
		free: false,
		lifetime: true,
	},
	{
		label: '終身創作者識別與優先曝光',
		free: false,
		lifetime: true,
	},
];

type PlanFeature = (typeof planFeatures)[number];

export function RoleSectionPlanComparison({
	isCreator = false,
	onUpgrade,
	isUpgrading,
}: {
	isCreator: boolean;
	onUpgrade: () => void;
	isUpgrading: boolean;
}) {
	return (
		<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
			<PlanComparisonCard
				title="免費方案"
				price="NT$0"
				description="適合想先體驗平台的學習者"
				features={planFeatures}
				planKey="free"
				action={
					<Button variant="outline" className="w-full" disabled>
						{isCreator ? '你已為創作者' : '目前方案'}
					</Button>
				}
			/>

			<PlanComparisonCard
				title="終生創作者方案"
				price="NT$6,990"
				description="一次性付款，終生保有創作者資格"
				features={planFeatures}
				planKey="lifetime"
				highlight
				action={
					<FormButton
						type="button"
						variant={isCreator ? 'outline' : 'default'}
						className="w-full"
						label={isCreator ? '你已為創作者' : '升級為創作者'}
						onClick={onUpgrade}
						disabled={isUpgrading || isCreator}
						isLoading={isUpgrading ?? false}
					/>
				}
			/>
		</div>
	);
}

export function PlanComparisonCard({
	title,
	price,
	description,
	features,
	planKey,
	action,
	highlight,
}: {
	title: string;
	price: string;
	description: string;
	features: PlanFeature[];
	planKey: 'free' | 'lifetime';
	action: React.ReactNode;
	highlight?: boolean;
}) {
	return (
		<div
			className={cn(
				'border-border flex h-full flex-col gap-6 rounded-lg border p-6 shadow-sm',
				highlight
					? 'border-primary shadow-primary/20 bg-primary-background'
					: 'bg-background',
			)}
		>
			<div className="text-muted-foreground">
				<p
					className={cn(
						't-heading-4 text-primary mb-2',
						highlight
							? 'text-primary font-bold'
							: 'text-foreground font-semibold',
					)}
				>
					{title}
				</p>
				<p className="text-foreground t-heading-3 font-semibold">{price}</p>
				<p className="t-body-4">{description}</p>
			</div>

			<ul className="t-body-3 space-y-2">
				{features.map((feature) => (
					<li
						key={feature.label}
						className="text-muted-foreground flex items-center gap-2"
					>
						{feature[planKey] ? (
							<Check className="text-success size-4 shrink-0" />
						) : (
							<Minus className="size-4 shrink-0" />
						)}
						{feature.label}
					</li>
				))}
			</ul>

			<div className="mt-6">{action}</div>
		</div>
	);
}
