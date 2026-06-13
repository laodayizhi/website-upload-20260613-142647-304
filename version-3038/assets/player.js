function initMoviePlayer(videoId, overlayId, source) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hls = null;
  var started = false;

  if (!video || !overlay || !source) {
    return;
  }

  function setSource() {
    if (started) {
      return;
    }
    started = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    setSource();
    overlay.classList.add('hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        overlay.classList.remove('hidden');
      });
    }
  }

  overlay.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('hidden');
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
