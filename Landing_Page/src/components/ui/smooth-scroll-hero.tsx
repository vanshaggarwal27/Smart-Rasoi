"use client";
import * as React from "react";

import {
	motion,
	useMotionTemplate,
	useScroll,
	useTransform,
} from "framer-motion";

export interface ISmoothScrollHeroProps {
	/**
	 * Height of the scroll section in pixels
	 * @default 1500
	 */
	scrollHeight?: number;
	/**
	 * Background image URL for desktop view
	 * @default "https://unsplash.com/photos/bowl-of-vegetable-salads-IGfIGP5ONV0"
	 */
	desktopImage?: string;
	/**
	 * Background image URL for mobile view
	 * @default "https://unsplash.com/photos/bowl-of-vegetable-salads-IGfIGP5ONV0"
	 */
	mobileImage?: string;
	/**
	 * Initial clip path percentage
	 * @default 25
	 */
	initialClipPercentage?: number;
	/**
	 * Final clip path percentage
	 * @default 75
	 */
	finalClipPercentage?: number;
}

interface ISmoothScrollHeroBackgroundProps extends Required<ISmoothScrollHeroProps> { }

const SmoothScrollHeroBackground: React.FC<ISmoothScrollHeroBackgroundProps> = ({
	scrollHeight,
	desktopImage,
	mobileImage,
	initialClipPercentage,
	finalClipPercentage,
}) => {
	const { scrollY } = useScroll();

	const clipStart = useTransform(
		scrollY,
		[0, scrollHeight],
		[initialClipPercentage, 0]
	);
	const clipEnd = useTransform(
		scrollY,
		[0, scrollHeight],
		[finalClipPercentage, 100]
	);

	const clipPath = useMotionTemplate`polygon(${clipStart}% ${clipStart}%, ${clipEnd}% ${clipStart}%, ${clipEnd}% ${clipEnd}%, ${clipStart}% ${clipEnd}%)`;

	const backgroundSize = useTransform(
		scrollY,
		[0, scrollHeight + 500],
		["170%", "100%"]
	);

	return (
		<motion.div
			className="sticky top-0 h-screen w-full bg-beige z-0"
			style={{
				clipPath,
				willChange: "transform, opacity",
			}}
		>
			{/* Mobile background */}
			<motion.div
				className="absolute inset-0 md:hidden"
				style={{
					backgroundImage: `url(${mobileImage})`,
					backgroundSize,
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
			/>
			{/* Desktop background */}
			<motion.div
				className="absolute inset-0 hidden md:block"
				style={{
					backgroundImage: `url(${desktopImage})`,
					backgroundSize,
					backgroundPosition: "center",
					backgroundRepeat: "no-repeat",
				}}
			/>
		</motion.div>
	);
};

/**
 * A smooth scroll hero component with parallax background effect
 * @param props - Component props
 * @returns React component
 */
export const SmoothScrollHero: React.FC<ISmoothScrollHeroProps> = ({
	scrollHeight = 1500,
	desktopImage = "https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2670&auto=format&fit=crop",
	mobileImage = "https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=1000&auto=format&fit=crop",
	initialClipPercentage = 25,
	finalClipPercentage = 75,
}) => {
	return (
		<div
			style={{ height: `calc(${scrollHeight}px + 100vh)` }}
			className="relative w-full"
		>
			<SmoothScrollHeroBackground
				scrollHeight={scrollHeight}
				desktopImage={desktopImage}
				mobileImage={mobileImage}
				initialClipPercentage={initialClipPercentage}
				finalClipPercentage={finalClipPercentage}
			/>

			{/* Overlay UI components can go here inside the scrolling Hero container */}
			<div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center">
				<h1 className="text-5xl md:text-8xl font-black text-black text-center tracking-tight" style={{ 
					textShadow: '0 4px 12px rgba(255,255,255,0.9), 0 0 40px rgba(255,255,255,1), 0 0 80px rgba(255,255,255,1)' 
				}}>
					Eat Smarter, <br /><span className="text-moss">Not Faster</span>
				</h1>
				<p className="mt-6 text-lg md:text-2xl text-black font-semibold text-center max-w-2xl px-4" style={{ 
					textShadow: '0 2px 8px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.9)' 
				}}>
					Your AI-powered cafeteria system that understands your health, habits, and goals.
				</p>
				<div className="mt-8 flex gap-4 pointer-events-auto">
					<button className="px-8 py-4 bg-moss hover:bg-moss-hover text-midnight-darkest rounded-full font-bold transition-all shadow-lg text-lg">
						Login to System
					</button>
					<button className="px-8 py-4 bg-midnight/60 hover:bg-midnight/80 backdrop-blur-md text-beige border border-white/20 rounded-full font-bold transition-all shadow-lg text-lg">
						Create Account
					</button>
				</div>
			</div>
		</div>
	);
};

export default SmoothScrollHero;
