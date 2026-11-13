/* The exhibition frame runs the exact approved 3000 ms logo + welcome message. */
(() => {
  const root = document.getElementById('logo-root');
  const notify = type => parent.postMessage({ type }, location.origin === 'null' ? '*' : location.origin);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

  async function start() {
    try {
      await Promise.all([...root.querySelectorAll('image')].map(element => {
        const image = new Image();
        image.src = element.getAttribute('href');
        return image.decode();
      }));
      await nextFrame();
      const animations = root.getAnimations({ subtree: true });
      for (const animation of animations) {
        animation.pause();
        animation.currentTime = reducedMotion.matches ? 3000 : 0;
      }
      document.documentElement.classList.add('is-ready');
      await nextFrame();
      notify('spirit-intro:ready');
      if (!reducedMotion.matches) {
        const startTime = document.timeline.currentTime;
        for (const animation of animations) {
          animation.play();
          animation.startTime = startTime;
        }
        await Promise.all(animations.map(animation => animation.finished));
      }
      // Give the finished welcome line a short reading beat before revealing the exhibit.
      setTimeout(() => notify('spirit-intro:complete'), 600);
    } catch (error) {
      notify('spirit-intro:error');
    }
  }
  start();
})();
