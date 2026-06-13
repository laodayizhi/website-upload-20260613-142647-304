(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var mainNav = document.querySelector("[data-main-nav]");
    if (navToggle && mainNav) {
      navToggle.addEventListener("click", function () {
        mainNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll(".filter-scope").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var genre = scope.querySelector("[data-filter-genre]");
      var items = Array.prototype.slice.call(scope.querySelectorAll(".searchable-item"));

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var genreValue = genre ? genre.value.trim().toLowerCase() : "";
        items.forEach(function (item) {
          var haystack = (item.getAttribute("data-search") || "").toLowerCase();
          var genres = (item.getAttribute("data-genre") || "").toLowerCase();
          var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
          var genreMatch = !genreValue || genres.indexOf(genreValue) !== -1;
          item.classList.toggle("is-filter-hidden", !(keywordMatch && genreMatch));
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (genre) {
        genre.addEventListener("change", applyFilter);
      }
    });
  });

  window.initializeMoviePlayer = function (url) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var loaded = false;

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function playVideo() {
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    function loadAndPlay() {
      if (!video || !url) {
        return;
      }
      hideOverlay();
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        video._hlsInstance = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      } else {
        video.src = url;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", loadAndPlay);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener("play", hideOverlay);
    }
  };
})();
