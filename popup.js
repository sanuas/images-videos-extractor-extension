/*
 * Image & Video Extractor Chrome Extension
 * ----------------------------------------
 * Version        : 1.0.0
 * Description    : Extracts and categorizes all images and videos from the current webpage.
 * Author         : ITS - Info Twist Solutions
 * Website        : https://its.net.in
 * Developer      : Sanu A S
 * Contact        : info@infotwistsolutions.com | +91-906-11-888-22
 * License        : MIT License
 * Last Updated   : July 2025
 */

function getImagesFromPage() {
  return Array.from(document.images)
    .map(img => img.src)
    .filter(src => src && !src.startsWith('data:'));
}

function getVideosFromPage() {
  const videos = Array.from(document.querySelectorAll('video'));
  return videos.map(video => video.currentSrc || video.src).filter(Boolean);
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tabId = tabs[0].id;

  // --- Load Images ---
  chrome.scripting.executeScript(
    {
      target: { tabId },
      func: getImagesFromPage
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error("Image script injection failed:", chrome.runtime.lastError.message);
        return;
      }

      const imageUrls = results[0].result.reverse();
      const largeContainer = document.getElementById('large-images');
      const mediumContainer = document.getElementById('medium-images');
      const smallContainer = document.getElementById('small-images');

      let largeCount = 0;
      let mediumCount = 0;
      let smallCount = 0;

      if (imageUrls.length === 0) {
        largeContainer.textContent = "No images found.";
        mediumContainer.textContent = "No images found.";
        smallContainer.textContent = "No images found.";
        return;
      }

      let processed = 0;

      imageUrls.forEach(url => {
        const image = new Image();
        image.src = url;
        image.onload = () => {
          const width = image.naturalWidth;
          const height = image.naturalHeight;
          const dimensions = `${width}px \u00D7 ${height}px`;

          const div = document.createElement('div');
          div.className = 'img-item';
          div.innerHTML = `
            <img src="${url}" draggable="true">
            <div class="dimension">${dimensions}</div>
            <a class="download-btn" href="${url}" download>Download</a>
          `;

          if (width >= 500 || height >= 500) {
            largeContainer.appendChild(div);
            largeCount++;
          } else if (width >= 300 || height >= 300) {
            mediumContainer.appendChild(div);
            mediumCount++;
          } else {
            smallContainer.appendChild(div);
            smallCount++;
          }

          processed++;
          if (processed === imageUrls.length) {
            if (largeCount === 0) largeContainer.textContent = "No large images found.";
            if (mediumCount === 0) mediumContainer.textContent = "No medium images found.";
            if (smallCount === 0) smallContainer.textContent = "No small images found.";
          }
        };
      });
    }
  );

  // --- Load Videos ---
  chrome.scripting.executeScript(
    {
      target: { tabId },
      func: getVideosFromPage
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error("Video script injection failed:", chrome.runtime.lastError.message);
        return;
      }

      const videoUrls = results[0].result;
      const videoContainer = document.getElementById('video-list');

      if (videoUrls.length === 0) {
        videoContainer.textContent = "No videos found.";
        return;
      }

      videoUrls.forEach(url => {
        const div = document.createElement('div');
        div.className = 'video-item';
        div.innerHTML = `
          <video src="${url}" controls></video>
          <a class="download-btn" href="${url}" download>Download</a>
        `;
        videoContainer.appendChild(div);
      });
    }
  );
});
