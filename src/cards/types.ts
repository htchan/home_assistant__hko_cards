import { LitElement } from "lit";


export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  type: string;
  [key: string]: any;
}

export class HomeAssistantCard extends LitElement {
  static get cardType(): string { return "base-card"; }
  static get cardName(): string { return "Base Card"; }
  static get cardDescription(): string { return "Base class for custom cards"; }
  static get cardPreview(): boolean { return false; }
  getCardSize(): number | Promise<number> {
    return 3;
  }
  setConfig(config: any): void {}
}