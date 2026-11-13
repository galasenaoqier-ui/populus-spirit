/* A native modal keeps the exhibit loading behind a short, dismissible welcome. */
(() => {
  const dialog = document.getElementById('site-intro');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const skip = document.getElementById('skipIntro');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const seenKey = 'populus-spirit.welcome.v1';
  let frame = null;
  let fallbackTimer = null;
  let exitTimer = null;
  let leaving = false;
  let previousFocus = null;

  function hasSeenIntro() {
    try { return sessionStorage.getItem(seenKey) === '1'; }
    catch { return false; }
  }
  function close() {
    if (!dialog.open || leaving) return;
    leaving = true;
    clearTimeout(fallbackTimer);
    try { sessionStorage.setItem(seenKey, '1'); } catch { /* Storage is optional. */ }
    dialog.classList.add('is-leaving');
    exitTimer = setTimeout(() => {
      dialog.close();
      frame?.remove();
      frame = null;
      document.documentElement.classList.remove('intro-open');
      dialog.classList.remove('is-leaving');
      leaving = false;
      const focusTarget = previousFocus?.isConnected && previousFocus !== document.body
        ? previousFocus : document.querySelector('.site-header .brand');
      focusTarget?.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : 450);
  }
  function open() {
    if (dialog.open || reducedMotion.matches) return;
    clearTimeout(exitTimer);
    previousFocus = document.activeElement;
    frame = document.createElement('iframe');
    frame.title = '胡杨精灵 Logo 入场动画';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    frame.src = new URL('./index.html', document.currentScript?.src || scriptURL).href;
    dialog.prepend(frame);
    dialog.showModal();
    document.documentElement.classList.add('intro-open');
    skip.focus({ preventScroll: true });
    // Failed requests, unsupported animation APIs or background timer throttling cannot trap entry.
    fallbackTimer = setTimeout(close, 8500);
  }
  const scriptURL = document.currentScript.src;
  skip.addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  window.addEventListener('message', event => {
    if (!frame || event.source !== frame.contentWindow || event.origin !== location.origin) return;
    if (event.data?.type === 'spirit-intro:complete' || event.data?.type === 'spirit-intro:error') close();
  });
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) close(); });
  window.addEventListener('pageshow', event => { if (event.persisted && dialog.open) close(); });
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('replayIntro')?.addEventListener('click', open);
  });
  if (!hasSeenIntro() && !location.hash && !reducedMotion.matches) open();
})();
