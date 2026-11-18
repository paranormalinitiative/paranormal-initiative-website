(function () {
  const closeViewer = () => {
    const viewer = document.querySelector('.tpi-image-lightbox');
    if (!viewer) return;
    viewer.remove();
    document.body.classList.remove('tpi-lightbox-open');
  };

  const openViewer = image => {
    closeViewer();
    const viewer = document.createElement('div');
    viewer.className = 'tpi-image-lightbox';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.setAttribute('aria-label', 'Expanded location image');

    const close = document.createElement('button');
    close.className = 'tpi-image-lightbox-close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Close expanded image');
    close.textContent = '×';

    const expanded = document.createElement('img');
    expanded.src = image.currentSrc || image.src;
    expanded.alt = image.alt;

    const hint = document.createElement('p');
    hint.className = 'tpi-image-lightbox-hint';
    hint.textContent = 'Click outside the image or press Escape to close';

    viewer.append(close, expanded, hint);
    document.body.append(viewer);
    document.body.classList.add('tpi-lightbox-open');
    close.focus();

    const onKeydown = event => {
      if (event.key === 'Escape') {
        document.removeEventListener('keydown', onKeydown);
        closeViewer();
      }
    };
    document.addEventListener('keydown', onKeydown);
    viewer.addEventListener('click', event => {
      if (event.target === viewer || event.target === close) {
        document.removeEventListener('keydown', onKeydown);
        closeViewer();
      }
    });
  };

  document.addEventListener('click', event => {
    const trigger = event.target.closest('.tpi-case-image-trigger');
    if (!trigger) return;
    event.preventDefault();
    const image = trigger.querySelector('img');
    if (image) openViewer(image);
  });
}());
