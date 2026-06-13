(function () {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function bindMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.classList.toggle('open');
    });
  }

  function bindCurrentYear() {
    var nodes = document.querySelectorAll('[data-current-year]');
    var year = new Date().getFullYear();
    nodes.forEach(function (node) {
      node.textContent = year;
    });
  }

  function bindHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindSearchForms() {
    var forms = document.querySelectorAll('[data-search-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || './search.html';
        window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
      });
    });
  }

  function bindLocalFilter() {
    var forms = document.querySelectorAll('[data-local-filter]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    forms.forEach(function (form) {
      var input = form.querySelector('[data-filter-input]');
      var list = document.querySelector('[data-search-list]');
      var empty = document.querySelector('[data-empty-state]');
      if (!input || !list) {
        return;
      }
      if (initialQuery) {
        input.value = initialQuery;
      }
      function applyFilter() {
        var query = input.value.trim().toLowerCase();
        var visible = 0;
        list.querySelectorAll('[data-card]').forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var matched = !query || text.indexOf(query) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      input.addEventListener('input', applyFilter);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        applyFilter();
      });
      applyFilter();
    });
  }

  function bindPlayers() {
    var players = document.querySelectorAll('[data-player]');
    players.forEach(function (player) {
      var video = player.querySelector('video[data-source]');
      var button = player.querySelector('[data-play-button]');
      if (!video) {
        return;
      }
      var source = video.getAttribute('data-source');
      var loaded = false;
      var hlsInstance = null;

      function loadSource() {
        if (loaded || !source) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }

      function playVideo() {
        loadSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (button && video.currentTime === 0) {
          button.classList.remove('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  onReady(function () {
    bindMenu();
    bindCurrentYear();
    bindHero();
    bindSearchForms();
    bindLocalFilter();
    bindPlayers();
  });
})();
