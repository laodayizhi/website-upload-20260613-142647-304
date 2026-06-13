(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        var open = mobilePanel.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        menuButton.textContent = open ? '×' : '☰';
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle('active', pos === current);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle('active', pos === current);
      });
    }

    function restartHero() {
      if (timer) {
        clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(current + 1);
        }, 5000);
      }
    }

    if (slides.length) {
      showSlide(0);
      restartHero();
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          restartHero();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          restartHero();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
          restartHero();
        });
      });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
      var input = scope.querySelector('.local-search');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
      var empty = scope.querySelector('.empty-state');
      var yearButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-year]'));
      var activeYear = 'all';

      if (scope.hasAttribute('data-search-page')) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (input) {
          input.value = q;
        }
      }

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var year = card.getAttribute('data-year') || '';
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedYear = activeYear === 'all' || year === activeYear;
          var show = matchedKeyword && matchedYear;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      yearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeYear = button.getAttribute('data-filter-year') || 'all';
          yearButtons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          applyFilter();
        });
      });

      applyFilter();
    });
  });
})();
