
import { H as Hls } from './hls-dru42stk.js';

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function setupMenu() {
  const toggle = qs('[data-menu-toggle]');
  const mobileNav = qs('[data-mobile-nav]');
  if (!toggle || !mobileNav) {
    return;
  }

  toggle.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

function setupHero() {
  qsa('[data-hero]').forEach((hero) => {
    const slides = qsa('[data-hero-slide]', hero);
    const dots = qsa('[data-hero-dot]', hero);
    const prev = qs('[data-hero-prev]', hero);
    const next = qs('[data-hero-next]', hero);
    let index = 0;
    let timer = null;

    if (slides.length <= 1) {
      return;
    }

    const show = (target) => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    prev?.addEventListener('click', () => {
      show(index - 1);
      restart();
    });

    next?.addEventListener('click', () => {
      show(index + 1);
      restart();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        restart();
      });
    });

    restart();
  });
}

function setupImageFallbacks() {
  qsa('img').forEach((img) => {
    img.addEventListener('error', () => {
      const box = img.closest('.poster, .hero-media, .detail-poster, .rank-thumb, .feature-card figure, .category-tile figure');
      if (box) {
        box.classList.add('is-fallback');
      }
      img.remove();
    }, { once: true });
  });
}

function parseYearRange(range, yearValue) {
  if (!range) {
    return true;
  }

  const year = Number.parseInt(yearValue, 10);
  if (!Number.isFinite(year)) {
    return false;
  }

  if (range === '2020+') {
    return year >= 2020;
  }

  const parts = range.split('-').map((item) => Number.parseInt(item, 10));
  if (parts.length === 2) {
    return year >= parts[0] && year <= parts[1];
  }

  return true;
}

function setupFilters() {
  qsa('[data-filter-root]').forEach((root) => {
    const input = qs('[data-search-input]', root);
    const typeFilter = qs('[data-type-filter]', root);
    const categoryFilter = qs('[data-category-filter]', root);
    const yearFilter = qs('[data-year-filter]', root);
    const reset = qs('[data-filter-reset]', root);
    const status = qs('[data-filter-count]', root);
    const cards = qsa('.movie-card, .rank-row', root);

    if (!cards.length) {
      return;
    }

    const apply = () => {
      const keyword = normalize(input?.value);
      const typeValue = normalize(typeFilter?.value);
      const categoryValue = normalize(categoryFilter?.value);
      const yearValue = yearFilter?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.category,
          card.textContent,
        ].join(' '));
        const typeOk = !typeValue || normalize(card.dataset.type).includes(typeValue);
        const categoryOk = !categoryValue || normalize(card.dataset.category) === categoryValue;
        const yearOk = parseYearRange(yearValue, card.dataset.year);
        const keywordOk = !keyword || haystack.includes(keyword);
        const matched = typeOk && categoryOk && yearOk && keywordOk;

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = `当前显示 ${visible} / ${cards.length} 部`;
      }
    };

    input?.addEventListener('input', apply);
    typeFilter?.addEventListener('change', apply);
    categoryFilter?.addEventListener('change', apply);
    yearFilter?.addEventListener('change', apply);
    reset?.addEventListener('click', () => {
      if (input) input.value = '';
      if (typeFilter) typeFilter.value = '';
      if (categoryFilter) categoryFilter.value = '';
      if (yearFilter) yearFilter.value = '';
      apply();
    });

    apply();
  });
}

function setupPlayers() {
  qsa('.movie-player').forEach((player) => {
    const video = qs('video', player);
    const button = qs('[data-play-button]', player);
    const status = qs('[data-player-status]', player);
    const src = player.dataset.src;
    let initialized = false;

    if (!video || !button || !src) {
      return;
    }

    const setStatus = (message) => {
      if (status) {
        status.textContent = message || '';
      }
    };

    const initialize = () => {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;
      setStatus('正在加载播放源…');

      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });

        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('播放源已加载');
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            setStatus('播放源加载异常，请稍后重试');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.src = src;
        setStatus('当前浏览器可能需要 HLS 支持');
      }

      return Promise.resolve();
    };

    const play = async () => {
      button.classList.add('is-hidden');
      try {
        await initialize();
        await video.play();
        setStatus('');
      } catch (error) {
        button.classList.remove('is-hidden');
        setStatus('浏览器阻止了自动播放，请再次点击播放');
      }
    };

    button.addEventListener('click', play);
    video.addEventListener('play', () => button.classList.add('is-hidden'));
    video.addEventListener('pause', () => {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove('is-hidden');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMenu();
  setupHero();
  setupImageFallbacks();
  setupFilters();
  setupPlayers();
});
