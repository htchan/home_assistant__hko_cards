class HkoRadarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentTimeIndex = 14;
    this.imageSize = '128';
    this.maxTimeSlots = 15;
    this.preloadedImages = new Map();
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    this.config = config;
    this.render();
    this.preloadImages();
  }

  getTimeForIndex(index) {
    const now = new Date();
    const latestTime = new Date(now.getTime() - (4 * 60000));
    const minutes = latestTime.getMinutes();
    const roundedMinutes = Math.floor(minutes / 6) * 6;
    latestTime.setMinutes(roundedMinutes, 0, 0);
    
    const slotIndex = this.maxTimeSlots - 1 - index;
    return new Date(latestTime.getTime() - (slotIndex * 6 * 60000));
  }

  formatTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}`;
  }

  getImageUrl() {
    const time = this.getTimeForIndex(this.currentTimeIndex);
    const formatted = this.formatTime(time);
    return `https://www.hko.gov.hk/wxinfo/radars/rad_${this.imageSize}_png/2d${this.imageSize}nradar_${formatted}.jpg`;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .card {
          background: var(--card-background-color);
          border-radius: var(--ha-card-border-radius);
          box-shadow: var(--ha-card-box-shadow);
          padding: 16px;
          font-family: var(--paper-font-body1_-_font-family);
        }
        .header {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 16px;
          color: var(--primary-text-color);
        }
        .radar-container {
          text-align: center;
          margin-bottom: 16px;
        }
        .radar-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .controls {
          margin-bottom: 16px;
        }
        .time-slider {
          width: 100%;
          margin-bottom: 8px;
        }
        .time-display {
          text-align: center;
          font-size: 14px;
          color: var(--secondary-text-color);
          margin-bottom: 16px;
        }
        .size-buttons {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .size-button {
          padding: 8px 16px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .size-button:hover {
          background: var(--secondary-background-color);
        }
        .size-button.active {
          background: var(--primary-color);
          color: var(--text-primary-color);
          border-color: var(--primary-color);
        }
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: var(--secondary-text-color);
        }
      </style>
      <div class="card">
        <div class="header">HKO Radar</div>
        <div class="radar-container">
          <img class="radar-image" src="${this.getImageUrl()}" alt="HKO Radar" 
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
          <div class="loading" style="display: none;">Image not available</div>
        </div>
        <div class="controls">
          <input type="range" class="time-slider" 
                 min="0" max="${this.maxTimeSlots - 1}" 
                 value="${this.currentTimeIndex}">
          <div class="time-display">
            ${this.getTimeForIndex(this.currentTimeIndex).toLocaleString()}
          </div>
        </div>
        <div class="size-buttons">
          <button class="size-button ${this.imageSize === '064' ? 'active' : ''}" data-size="064">Small</button>
          <button class="size-button ${this.imageSize === '128' ? 'active' : ''}" data-size="128">Medium</button>
          <button class="size-button ${this.imageSize === '256' ? 'active' : ''}" data-size="256">Large</button>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const slider = this.shadowRoot.querySelector('.time-slider');
    const sizeButtons = this.shadowRoot.querySelectorAll('.size-button');
    const radarImage = this.shadowRoot.querySelector('.radar-image');
    const loadingDiv = this.shadowRoot.querySelector('.loading');

    slider.addEventListener('input', (e) => {
      this.currentTimeIndex = parseInt(e.target.value);
      this.updateImage();
      this.updateTimeDisplay();
    });

    sizeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.imageSize = e.target.dataset.size;
        this.updateSizeButtons();
        this.updateImage();
        this.preloadImages();
      });
    });

    radarImage.addEventListener('load', () => {
      radarImage.style.display = 'block';
      loadingDiv.style.display = 'none';
    });

    radarImage.addEventListener('error', () => {
      radarImage.style.display = 'none';
      loadingDiv.style.display = 'flex';
    });
  }

  updateImage() {
    const radarImage = this.shadowRoot.querySelector('.radar-image');
    const loadingDiv = this.shadowRoot.querySelector('.loading');
    
    loadingDiv.style.display = 'flex';
    radarImage.style.display = 'none';
    radarImage.src = this.getImageUrl();
  }

  updateTimeDisplay() {
    const timeDisplay = this.shadowRoot.querySelector('.time-display');
    timeDisplay.textContent = this.getTimeForIndex(this.currentTimeIndex).toLocaleString();
  }

  updateSizeButtons() {
    const sizeButtons = this.shadowRoot.querySelectorAll('.size-button');
    sizeButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.size === this.imageSize);
    });
  }

  preloadImages() {
    for (let i = 0; i < this.maxTimeSlots; i++) {
      const time = this.getTimeForIndex(i);
      const formatted = this.formatTime(time);
      const url = `https://www.hko.gov.hk/wxinfo/radars/rad_${this.imageSize}_png/2d${this.imageSize}nradar_${formatted}.jpg`;
      
      if (!this.preloadedImages.has(url)) {
        const img = new Image();
        img.src = url;
        this.preloadedImages.set(url, img);
      }
    }
  }

  getCardSize() {
    return 3;
  }

  static getConfigElement() {
    return document.createElement('hko-radar-card-editor');
  }

  static getStubConfig() {
    return {};
  }
}

customElements.define('hko-radar-card', HkoRadarCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'hko-radar-card',
  name: 'HKO Radar Card',
  description: 'Display HKO radar images with time slider and size options'
});

console.info(
  `%c HKO-RADAR-CARD %c v1.0.0 `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray'
);