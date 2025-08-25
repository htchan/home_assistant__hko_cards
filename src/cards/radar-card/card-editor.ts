import { html } from "lit";
import { HomeAssistantCardEditor } from "../types";
import { HkoRadarCardConfig } from "./config";
import { EDITOR_TYPE, IMG_SIZE_LARGE, IMG_SIZE_MEDIUM, IMG_SIZE_SMALL, MAX_TIME_SLOTS } from "./const";

const SCHEMA = [
    { 
        name: "defaultSize",
        required: true,
        selector: { 
            select: {
                mode: "dropdown",
                options: [
                    { value: IMG_SIZE_SMALL, label: "Small" },
                    { value: IMG_SIZE_MEDIUM, label: "Medium" },
                    { value: IMG_SIZE_LARGE, label: "Large" }
                ]
            }
        }
    },
    { 
        name: "timeSlotCount",
        required: true,
        selector: { 
            number: {
                min: 10,
                max: 30,
                step: 5
            }
        }
    },
]

export class HkoRadarCardEditor extends HomeAssistantCardEditor {
    private config: HkoRadarCardConfig = {
        defaultSize: IMG_SIZE_MEDIUM,
        timeSlotCount: MAX_TIME_SLOTS,
    };

    static get properties() {
        return {
            config: { type: Object },
        };
    }

    static get editorType(): string { return EDITOR_TYPE; }

    setConfig(config: HkoRadarCardConfig): void {
        this.config = config
    }

    configChanged(newConfig: HkoRadarCardConfig) {
        console.log("Config changed", newConfig);
        const event = new Event("config-changed", {
            bubbles: true,
            composed: true
        });

        (event as any).detail = { config: newConfig };
        this.dispatchEvent(event);
    }
    
    render() {
        return html`
            <ha-form
                .data=${this.config}
                .schema=${SCHEMA}
                @value-changed=${(e: CustomEvent) => this.configChanged(e.detail.value)}
            >
            </ha-form>
        `
    }
}