export const PLAYBACK_CONTROL_SCRIPT = `
(function() {
  'use strict';

  function findVideo() {
    return document.querySelector('video');
  }

  function findPlayer() {
    const selectors = [
      '.html5-video-player',
      '.video-stream',
      '#movie_player',
      '[class*="player"]',
      '[class*="Player"]',
      'video'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  window.addEventListener('message', function(event) {
    var data = event.data;
    if (!data || !data.type) return;

    var video = findVideo();
    if (!video) return;

    switch (data.type) {
      case 'play':
        video.play().catch(function() {});
        break;
      case 'pause':
        video.pause();
        break;
      case 'toggle':
        if (video.paused) {
          video.play().catch(function() {});
        } else {
          video.pause();
        }
        break;
      case 'seek':
        if (typeof data.time === 'number') {
          video.currentTime = data.time;
        }
        break;
      case 'setVolume':
        if (typeof data.volume === 'number') {
          video.volume = Math.max(0, Math.min(1, data.volume));
        }
        break;
      case 'setPlaybackRate':
        if (typeof data.rate === 'number') {
          video.playbackRate = data.rate;
        }
        break;
    }
  });

  var video = findVideo();
  if (video) {
    video.addEventListener('play', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'play', time: video.currentTime }));
    });
    video.addEventListener('pause', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'pause', time: video.currentTime }));
    });
    video.addEventListener('seeked', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'seeked', time: video.currentTime }));
    });
    video.addEventListener('timeupdate', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'timeupdate', time: video.currentTime }));
    });
    video.addEventListener('ended', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ended' }));
    });
    video.addEventListener('waiting', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'buffering' }));
    });
    video.addEventListener('playing', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'playing' }));
    });

    var readyInterval = setInterval(function() {
      if (video.readyState >= 2) {
        clearInterval(readyInterval);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready', duration: video.duration }));
      }
    }, 500);
  }

  var readyCheck = setInterval(function() {
    var v = findVideo();
    if (v && v.readyState >= 2) {
      clearInterval(readyCheck);
      var rect = v.getBoundingClientRect();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'ready',
        duration: v.duration,
        width: rect.width,
        height: rect.height
      }));
    }
  }, 1000);

  true;
})();
`;
