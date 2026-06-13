(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  document.addEventListener("DOMContentLoaded", function () {
    var menuButton = qs(".menu-toggle");
    var mobileNav = qs(".mobile-nav");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    qsa("[data-carousel]").forEach(function (carousel) {
      var slides = qsa(".hero-slide", carousel);
      var dots = qsa(".hero-dots button", carousel);
      var prev = qs(".hero-control.prev", carousel);
      var next = qs(".hero-control.next", carousel);
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          restart();
        });
      });

      show(0);
      restart();
    });

    qsa("[data-filter-root]").forEach(function (root) {
      var input = qs(".filter-input", root);
      var typeSelect = qs(".filter-type", root);
      var yearSelect = qs(".filter-year", root);
      var cards = qsa("[data-search]", root);
      var empty = qs(".no-results", root);

      function match(card, value, typeValue, yearValue) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var okText = !value || text.indexOf(value) !== -1;
        var okType = !typeValue || text.indexOf(typeValue) !== -1;
        var okYear = !yearValue || text.indexOf(yearValue) !== -1;
        return okText && okType && okYear;
      }

      function apply() {
        var value = input ? input.value.trim().toLowerCase() : "";
        var typeValue = typeSelect ? typeSelect.value.trim().toLowerCase() : "";
        var yearValue = yearSelect ? yearSelect.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var ok = match(card, value, typeValue, yearValue);
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, typeSelect, yearSelect].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  });

  window.initMoviePlayer = function (videoId, url) {
    var video = document.getElementById(videoId);
    if (!video || !url) {
      return;
    }
    var wrap = video.closest(".player-wrap");
    var overlay = wrap ? wrap.querySelector(".play-overlay") : null;
    var ready = false;
    var hls = null;

    function prepare() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ maxBufferLength: 30, backBufferLength: 60 });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
      video.controls = true;
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  };
})();
