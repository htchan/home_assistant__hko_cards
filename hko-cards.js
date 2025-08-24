class HkoRadarCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.imageSize = '128';
    this.maxTimeSlots = 15;
    this.currentTimeIndex = this.maxTimeSlots - 1;
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
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        .center {
          text-align: center;
        }
        .ha-card-button {
          padding: 8px 16px;
          border: 1px solid var(--divider-color);
          background: var(--card-background-color);
          color: var(--primary-text-color);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ha-card-button:hover {
          background: var(--secondary-background-color);
        }
        .ha-card-button.active {
          background: var(--primary-color);
          color: var(--text-primary-color);
          border-color: var(--primary-color);
        }
      </style>
      <ha-card>
        <div class="card-content">
          <img id="radar-image" src="${this.getImageUrl()}" alt="HKO Radar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        </div>
        <div class="card-content center">
          <input type="range" id="time-slider" style="width: 100%;" min="0" max="${this.maxTimeSlots - 1}" value="${this.currentTimeIndex}">
          <div id="time-display">${this.getTimeForIndex(this.currentTimeIndex).toLocaleString()}</div>
        </div>
        <div class="card-content center">
          <button class="ha-card-button ${this.imageSize === '064' ? 'active' : ''}" data-size="064">Small</button>
          <button class="ha-card-button ${this.imageSize === '128' ? 'active' : ''}" data-size="128">Medium</button>
          <button class="ha-card-button ${this.imageSize === '256' ? 'active' : ''}" data-size="256">Large</button>
        </div>
      </ha-card>
    `;

    this.setupEventListeners();
  }

  setupEventListeners() {
    const slider = this.shadowRoot.querySelector('#time-slider');
    const sizeButtons = this.shadowRoot.querySelectorAll('.ha-card-button');

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
  }

  updateImage() {
    const radarImage = this.shadowRoot.querySelector('#radar-image');
    radarImage.src = this.getImageUrl();
  }

  updateTimeDisplay() {
    const timeDisplay = this.shadowRoot.querySelector('#time-display');
    timeDisplay.textContent = this.getTimeForIndex(this.currentTimeIndex).toLocaleString();
  }

  updateSizeButtons() {
    const sizeButtons = this.shadowRoot.querySelectorAll('.ha-card-button');
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