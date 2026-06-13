(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function attachStream(video, url) {
        if (!video || !url) {
            return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.getAttribute("src") !== url) {
                video.setAttribute("src", url);
            }
            return video.play();
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video._hlsInstance) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            }
            if (video.readyState > 0) {
                return video.play();
            }
            return new Promise(function (resolve) {
                video.addEventListener("loadedmetadata", function () {
                    video.play().then(resolve).catch(resolve);
                }, { once: true });
            });
        }
        if (video.getAttribute("src") !== url) {
            video.setAttribute("src", url);
        }
        return video.play();
    }

    ready(function () {
        Array.prototype.slice.call(document.querySelectorAll(".video-shell")).forEach(function (shell) {
            var video = shell.querySelector("video");
            var trigger = shell.querySelector(".play-cover");
            var url = trigger ? trigger.getAttribute("data-url") : "";

            function play() {
                shell.classList.add("is-playing");
                if (trigger) {
                    trigger.hidden = true;
                }
                attachStream(video, url).catch(function () {
                    if (trigger) {
                        trigger.hidden = false;
                    }
                    shell.classList.remove("is-playing");
                });
            }

            if (trigger) {
                trigger.addEventListener("click", function (event) {
                    event.preventDefault();
                    play();
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!video.currentSrc) {
                        play();
                    }
                });
                video.addEventListener("play", function () {
                    shell.classList.add("is-playing");
                    if (trigger) {
                        trigger.hidden = true;
                    }
                });
            }
        });
    });
}());
