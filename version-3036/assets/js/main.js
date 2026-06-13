(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.getElementById("mobileMenu");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector("[data-filter-input]");

    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        filterInput.addEventListener("input", function () {
            var keyword = filterInput.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                card.style.display = text.indexOf(keyword) > -1 ? "" : "none";
            });
        });
    }

    var searchPageForm = document.getElementById("searchPageForm");
    var searchResults = document.getElementById("searchResults");
    var searchInput = document.getElementById("searchPageInput");

    if (searchPageForm && searchResults && searchInput && window.MovieSearchIndex) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        searchInput.value = query;

        function renderResults(keyword) {
            var normalized = keyword.trim().toLowerCase();
            var results = window.MovieSearchIndex.filter(function (item) {
                var text = [
                    item.title,
                    item.year,
                    item.region,
                    item.genre,
                    item.category,
                    item.tags,
                    item.oneLine
                ].join(" ").toLowerCase();

                return !normalized || text.indexOf(normalized) > -1;
            }).slice(0, 120);

            if (!results.length) {
                searchResults.innerHTML = '<div class="empty-state">未找到相关内容</div>';
                return;
            }

            searchResults.innerHTML = '<div class="movie-grid"></div>';
            var grid = searchResults.querySelector(".movie-grid");

            results.forEach(function (item) {
                var card = document.createElement("article");
                card.className = "movie-card movie-card-compact";
                card.innerHTML = [
                    '<a class="poster-wrap" href="' + item.url + '">',
                    '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
                    '<span class="poster-shade"></span>',
                    '<span class="play-chip">播放</span>',
                    '</a>',
                    '<div class="movie-card-body">',
                    '<div class="movie-meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
                    '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
                    '<p>' + escapeHtml(item.oneLine) + '</p>',
                    '<div class="tag-list"><span>' + escapeHtml(item.genre) + '</span></div>',
                    '</div>'
                ].join("");
                grid.appendChild(card);
            });
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"']/g, function (character) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;",
                    "'": "&#039;"
                }[character];
            });
        }

        searchPageForm.addEventListener("submit", function (event) {
            event.preventDefault();
            renderResults(searchInput.value);
        });

        renderResults(query);
    }
})();
