import React, { useEffect, useRef, useState } from 'react';

/**
 * CountUp Component
 * Animates counting from 0 to target value when scrolled into view using IntersectionObserver (~1.5s ease-out).
 */
export default function CountUp({
  target,
  decimals = 0,
  prefix = '',
  suffix = '',
  duration = 1500,
  label = '',
}) {
  const [currentValue, setCurrentValue] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime = null;
    let animationFrame;

    // Ease-out cubic: 1 - Math.pow(1 - progress, 3)
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);

      const val = easeOutProgress * target;
      setCurrentValue(val);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCurrentValue(target);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [hasStarted, target, duration]);

  const formattedValue =
    decimals > 0
      ? currentValue.toFixed(decimals)
      : Math.round(currentValue).toLocaleString();

  return (
    <div ref={elementRef} className="flex flex-col items-center sm:items-start text-center sm:text-left">
      <div className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-[#0A0A0A] font-headline tabular-nums leading-none">
        <span>{prefix}</span>
        <span>{formattedValue}</span>
        <span>{suffix}</span>
      </div>
      {label && (
        <p className="mt-3 text-sm sm:text-base text-neutral-500 font-normal leading-relaxed max-w-xs">
          {label}
        </p>
      )}
    </div>
  );
}
