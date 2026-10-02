import { useLayoutEffect } from 'react';
import { gsap } from './gsap';
import { useReducedMotion } from './useReducedMotion';

export function useGsapReveal(scope, selector = '[data-reveal]', dependencies = []) {
  const reduced = useReducedMotion();
  const dependencyKey = JSON.stringify(dependencies);
  useLayoutEffect(() => {
    if (!scope.current || reduced) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((element) => {
        gsap.fromTo(element, { autoAlpha: 0, y: 28 }, {
          autoAlpha: 1, y: 0, duration: 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true }
        });
      });
    }, scope);
    return () => ctx.revert();
  }, [reduced, scope, selector, dependencyKey]);
}
