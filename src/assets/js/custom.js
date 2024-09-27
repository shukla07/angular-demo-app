function getHeight() {
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
getHeight();
// We listen to the resize event
window.addEventListener('resize', getHeight);

// disabled zoom pinch in ios mobile safari
// sonarignore:start
if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
  window.document.addEventListener(
    'touchmove',
    function (e) {
      if (document.basURI !== environment.baseUrl) {
        return;
      }
      if (e.scale !== 1) {
        e.preventDefault();
      }
    },
    {passive: false},
  );
}
// sonarignore:end

// remove extra disabled class - after dialog open - then browser back button click
window.onpopstate = function () {
  let element = document.querySelector('html');
  element.classList.remove('cdk-global-scrollblock');
};
