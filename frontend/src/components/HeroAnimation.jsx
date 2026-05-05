import Lottie from 'lottie-react';
import webDevAnimation from '../assets/animated/web-development.json';

export default function HeroAnimation() {
  return <Lottie animationData={webDevAnimation} loop className="w-full max-w-[460px] mx-auto" />;
}
