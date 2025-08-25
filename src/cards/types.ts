import { LitElement } from "lit";


export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  type: string;
  [key: string]: any;
}

export class HomeAssistantCardEditor extends LitElement {
  static get editorType(): string { return "base-card-editor"; }
  setConfig(config: unknown): void {}
  configChanged(newConfig: unknown) {
    const event = new CustomEvent("config-changed", {
      bubbles: true,
      composed: true,
      detail: { config: newConfig },
    });
    this.dispatchEvent(event);
  }
}

export class HomeAssistantCard extends LitElement {
  static get cardType(): string { return "base-card"; }
  static get cardName(): string { return "Base Card"; }
  static get cardDescription(): string { return "Base class for custom cards"; }
  static get cardPreview(): boolean { return false; }
  static get cardEditor(): (typeof HomeAssistantCardEditor | null) { return null; }
  getCardSize(): number | Promise<number> {
    return 3;
  }
  setConfig(config: unknown): void {}
}