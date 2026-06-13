function initializePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var panel = document.querySelector("[data-player-panel]");
  var button = document.querySelector("[data-player-button]");
  var notice = document.querySelector("[data-player-notice]");
  var hlsInstance = null;

  if (!video) {
    return;
  }

  function showNotice(message) {
    if (notice) {
      notice.textContent = message;
    }
  }

  function hidePanel() {
    if (panel) {
      panel.classList.add("is-hidden");
    }
  }

  function showPanel() {
    if (panel) {
      panel.classList.remove("is-hidden");
    }
  }

  function startPlayback() {
    hidePanel();
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        showPanel();
      });
    }
  }

  if (window.Hls && window.Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hlsInstance.loadSource(streamUrl);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      showNotice("");
    });
    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        showNotice("视频暂时无法播放，请稍后再试");
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamUrl;
    video.addEventListener("loadedmetadata", function () {
      showNotice("");
    }, { once: true });
    video.addEventListener("error", function () {
      showNotice("视频暂时无法播放，请稍后再试");
    });
  } else {
    showNotice("视频暂时无法播放，请稍后再试");
  }

  if (panel) {
    panel.addEventListener("click", startPlayback);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
