import { Grid2X2Plus } from 'lucide-react';

// Social icon SVG paths (brand icons removed from lucide-react v0.400+)
const SocialIcon = ({ path, className = "size-4" }: { path: string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

const SOCIAL_PATHS = {
  facebook: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
  github: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
  instagram: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2z",
  linkedin: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  twitter: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",
  youtube: "M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z",
};

export function MinimalFooter() {
	const year = new Date().getFullYear();

	const company = [
		{
			title: 'About Us',
			href: '#',
		},
		{
			title: 'Careers',
			href: '#',
		},
		{
			title: 'Brand assets',
			href: '#',
		},
		{
			title: 'Privacy Policy',
			href: '#',
		},
		{
			title: 'Terms of Service',
			href: '#',
		},
	];

	const resources = [
		{
			title: 'Blog',
			href: '#',
		},
		{
			title: 'Help Center',
			href: '#',
		},
		{
			title: 'Contact Support',
			href: '#',
		},
		{
			title: 'Community',
			href: '#',
		},
		{
			title: 'Security',
			href: '#',
		},
	];

	const socialLinks = [
		{
			icon: <SocialIcon path={SOCIAL_PATHS.facebook} />,
			link: '#',
		},
		{
			icon: <SocialIcon path={SOCIAL_PATHS.github} />,
			link: '#',
		},
		{
			icon: <SocialIcon path={SOCIAL_PATHS.instagram} />,
			link: '#',
		},
		{
			icon: <SocialIcon path={SOCIAL_PATHS.linkedin} />,
			link: '#',
		},
		{
			icon: <SocialIcon path={SOCIAL_PATHS.twitter} />,
			link: '#',
		},
		{
			icon: <SocialIcon path={SOCIAL_PATHS.youtube} />,
			link: '#',
		},
	];
	return (
		<footer className="relative bg-[#1C4D35] text-beige border-t border-moss/50">
			<div className="bg-[radial-gradient(35%_80%_at_30%_0%,rgba(131,153,88,0.15),transparent)] w-full">
				<div className="grid max-w-6xl mx-auto grid-cols-6 gap-6 px-10 py-16 md:px-16">
					<div className="col-span-6 flex flex-col gap-5 md:col-span-4">
						<a href="#" className="w-max opacity-80 hover:opacity-100 transition-opacity">
							<Grid2X2Plus className="size-8 text-moss" />
						</a>
						<p className="text-beige/80 font-medium max-w-sm font-mono text-sm text-balance">
							An AI-powered Smart Rasoi System optimizing health and eliminating food waste.
						</p>
						<div className="flex gap-2">
							{socialLinks.map((item, i) => (
								<a
									key={i}
									className="hover:bg-moss/10 text-moss transition-colors rounded-md border border-moss/20 p-1.5"
									target="_blank"
									href={item.link}
								>
									{item.icon}
								</a>
							))}
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-moss font-bold mb-1 text-xs uppercase tracking-wider">
							Resources
						</span>
						<div className="flex flex-col gap-1 mt-2">
							{resources.map(({ href, title }, i) => (
								<a
									key={i}
									className="w-max py-1 text-sm text-beige/80 font-medium duration-200 hover:text-moss hover:underline"
									href={href}
								>
									{title}
								</a>
							))}
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-moss font-bold mb-1 text-xs uppercase tracking-wider">Company</span>
						<div className="flex flex-col gap-1 mt-2">
							{company.map(({ href, title }, i) => (
								<a
									key={i}
									className="w-max py-1 text-sm text-beige/80 font-medium duration-200 hover:text-moss hover:underline"
									href={href}
								>
									{title}
								</a>
							))}
						</div>
					</div>
				</div>
				<div className="bg-moss/20 absolute inset-x-0 h-px w-full" />
				<div className="flex max-w-6xl mx-auto flex-col justify-between gap-2 pt-6 pb-8 px-10 md:px-16">
					<p className="text-beige/60 font-medium text-center">
						© <a href="#" className="hover:text-moss transition-colors font-medium">SmartRasoi</a>. All rights
						reserved {year}
					</p>
				</div>
			</div>
		</footer>
	);
}
