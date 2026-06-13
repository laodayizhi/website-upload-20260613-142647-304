(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function initMenu() {
        var toggle = document.querySelector("[data-nav-toggle]");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initCardFilter() {
        var input = document.querySelector("[data-card-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        if (!input && !chips.length) {
            return;
        }
        var active = "all";

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var group = card.getAttribute("data-group") || "";
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchGroup = active === "all" || group.indexOf(active) !== -1 || haystack.indexOf(active.toLowerCase()) !== -1;
                card.style.display = matchKeyword && matchGroup ? "" : "none";
            });
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                active = chip.getAttribute("data-filter-value") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                apply();
            });
        });
        apply();
    }

    function movieCard(movie) {
        return '' +
            '<article class="movie-card" data-search="' + escapeHTML([movie.title, movie.category, movie.year, movie.region, movie.type, movie.genre, movie.tags].join(" ")) + '" data-group="' + escapeHTML([movie.type, movie.genre].join(" ")) + '">' +
                '<a class="movie-card-link" href="' + escapeHTML(movie.url) + '">' +
                    '<span class="movie-thumb">' +
                        '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
                        '<span class="card-play">▶</span>' +
                        '<span class="card-duration">' + escapeHTML(movie.duration) + '</span>' +
                    '</span>' +
                    '<span class="movie-card-body">' +
                        '<h3>' + escapeHTML(movie.title) + '</h3>' +
                        '<p class="card-summary">' + escapeHTML(movie.oneLine) + '</p>' +
                        '<span class="card-meta"><span><strong>★ ' + escapeHTML(movie.rating) + '</strong></span><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.category) + '</span></span>' +
                    '</span>' +
                '</a>' +
            '</article>';
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        if (!form || !input || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";

        function render() {
            var query = input.value.trim().toLowerCase();
            var pool = window.SEARCH_MOVIES.filter(function (movie) {
                var haystack = [movie.title, movie.category, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
                return !query || haystack.indexOf(query) !== -1;
            }).slice(0, 120);
            if (!pool.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配内容，可以尝试更换关键词。</div>';
                return;
            }
            results.innerHTML = '<div class="movie-grid">' + pool.map(movieCard).join("") + '</div>';
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var next = query ? "?q=" + encodeURIComponent(query) : window.location.pathname;
            window.history.replaceState(null, "", next);
            render();
        });
        input.addEventListener("input", render);
        render();
    }

    ready(function () {
        initMenu();
        initHero();
        initCardFilter();
        initSearchPage();
    });
}());
