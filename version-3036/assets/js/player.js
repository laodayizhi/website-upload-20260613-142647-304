(function () {
    function setupStreamingPlayer(options) {
        var video = document.getElementById(options.videoId);
        var button = document.getElementById(options.buttonId);
        var source = options.source;
        var hls = null;
        var attached = false;

        if (!video || !button || !source) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function startPlayback() {
            attachSource();
            button.classList.add("is-hidden");
            video.setAttribute("controls", "controls");

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    window.setTimeout(function () {
                        video.play().catch(function () {});
                    }, 600);
                });
            }
        }

        button.addEventListener("click", startPlayback);

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.setupStreamingPlayer = setupStreamingPlayer;
})();
