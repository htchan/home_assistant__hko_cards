import { HomeAssistantCard } from "../cards/types";


export function registerCard(card: typeof HomeAssistantCard) {
    customElements.define(card.cardType, card);

    const cardEditor = card.cardEditor;
    if (cardEditor) {
        customElements.define(cardEditor.editorType, cardEditor);
    }

    const windowWithCards = window as unknown as Window & {
        customCards: unknown[];
    };
    windowWithCards.customCards = windowWithCards.customCards || [];
    windowWithCards.customCards.push({
        type: card.cardType,
        name: card.cardName,
        description: card.cardDescription,
        preview: card.cardPreview,
    });
}