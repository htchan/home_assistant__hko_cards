import { css } from "lit";

export const cardStyles = css`
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
`;