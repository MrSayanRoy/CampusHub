import { useState, useEffect } from 'react';

/**
 * useScrollEffects
 * Handles scroll progress, header background transition threshold (>40px),
 * subtle parallax offset for hero media (0.3x scroll speed),
 * and checks for prefers-reduced-motion.
 */
export function useScrollEffects() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMediaChange);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      setScrollProgress(progress);
      setIsHeaderScrolled(scrollY > 40);

      if (!mediaQuery.matches) {
        setParallaxOffset(scrollY * 0.3);
      } else {
        setParallaxOffset(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return {
    scrollProgress,
    isHeaderScrolled,
    parallaxOffset,
    prefersReducedMotion,
  };
}

/**
 * useScrollReveal
 * Attaches an IntersectionObserver to observe all elements with class .reveal-on-scroll.
 * When in view, adds the 'reveal-visible' class with staggered delays for siblings.
 */
export function useScrollReveal(dependency = null) {
  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const elements = document.querySelectorAll('.reveal-on-scroll');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const staggerDelay = el.getAttribute('data-stagger-delay') || '0';
            setTimeout(() => {
              el.classList.add('reveal-visible');
            }, parseInt(staggerDelay, 10));
            observer.unobserve(el);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach((el, index) => {
      if (!el.getAttribute('data-stagger-delay')) {
        const siblingIndex = index % 5;
        el.setAttribute('data-stagger-delay', (siblingIndex * 80).toString());
      }
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [dependency]);
}
