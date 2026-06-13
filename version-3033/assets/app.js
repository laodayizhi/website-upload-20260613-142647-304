(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    if (slides.length === 0) {
      return;
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }

    show(0);

    window.setInterval(function () {
      show(current + 1);
    }, 5600);
  }

  function setupFilters() {
    var form = document.querySelector("[data-filter-form]");

    if (!form) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var keyword = form.querySelector("[data-filter-keyword]");
    var type = form.querySelector("[data-filter-type]");
    var year = form.querySelector("[data-filter-year]");

    function apply() {
      var q = normalize(keyword && keyword.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var cardType = normalize(card.getAttribute("data-type"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var matchedKeyword = !q || text.indexOf(q) !== -1;
        var matchedType = !typeValue || cardType.indexOf(typeValue) !== -1;
        var matchedYear = !yearValue || cardYear === yearValue;

        card.hidden = !(matchedKeyword && matchedType && matchedYear);
      });
    }

    form.addEventListener("input", apply);
    form.addEventListener("change", apply);

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && keyword) {
      keyword.value = query;
    }

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var trigger = shell.querySelector("[data-play-trigger]");
      var prepared = false;
      var hlsInstance = null;

      if (!video) {
        return;
      }

      function prepare() {
        var stream = video.getAttribute("data-stream");

        if (prepared || !stream) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }

        prepared = true;
      }

      function start() {
        prepare();
        shell.classList.add("is-playing");
        video.play().catch(function () {});
      }

      if (trigger) {
        trigger.addEventListener("click", start);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("ended", function () {
        shell.classList.remove("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
