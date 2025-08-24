export function registerCard(card) {
    customElements.define(card.cardType, card);

    window.customCards = window.customCards || [];
    window.customCards.push({
        type: card.cardType,
        name: card.cardName,
        description: card.cardDescription,
    });
}