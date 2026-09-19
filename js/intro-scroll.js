const heroTrack = document.querySelector('.hero');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (heroTrack) {
  const setProgress = (progress) => {
    document.body.style.setProperty('--intro-progress', String(progress));
  };

  if (reducedMotion.matches) {
    setProgress(1);
  } else {
    let framePending = false;

    const updateProgress = () => {
      framePending = false;
      const rect = heroTrack.getBoundingClientRect();
      const scrollRange = rect.height - window.innerHeight;
      const progress = scrollRange > 0 ? (-rect.top) / scrollRange : 1;
      setProgress(Math.min(1, Math.max(0, progress)));
    };

    const requestProgressUpdate = () => {
      if (framePending) return;
      framePending = true;
      window.requestAnimationFrame(updateProgress);
    };

    window.addEventListener('scroll', requestProgressUpdate, { passive: true });
    window.addEventListener('resize', requestProgressUpdate);
    window.addEventListener('orientationchange', requestProgressUpdate);
    updateProgress();
  }
}
