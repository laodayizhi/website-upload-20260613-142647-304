(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
      var prev = document.querySelector("[data-hero-prev]");
      var next = document.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
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
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });
      show(0);
      restart();
    }

    var searchInput = document.querySelector("[data-movie-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var noResults = document.querySelector("[data-no-results]");
    var activeFilter = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function applySearch() {
      if (!cards.length) {
        return;
      }
      var keyword = normalize(searchInput ? searchInput.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
        var filterText = normalize(card.getAttribute("data-filter"));
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedFilter = activeFilter === "all" || filterText.indexOf(activeFilter) !== -1 || haystack.indexOf(activeFilter) !== -1;
        var showCard = matchedKeyword && matchedFilter;
        card.style.display = showCard ? "" : "none";
        if (showCard) {
          visible += 1;
        }
      });
      if (noResults) {
        noResults.classList.toggle("is-visible", visible === 0);
      }
    }

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        searchInput.value = query;
      }
      searchInput.addEventListener("input", applySearch);
      applySearch();
    }

    filterButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = normalize(button.getAttribute("data-filter-button"));
        filterButtons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applySearch();
      });
    });
  });
})();
