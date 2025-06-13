"use strict";
/**
 * Text name generation logic for the Renamer plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTextName = generateTextName;
const text_utils_1 = require("../utils/text-utils");
const color_utils_1 = require("../utils/color-utils");
/**
 * Generates a descriptive name for text nodes
 */
async function generateTextName(node, settings) {
    const nameParts = [];
    // Use text content as the primary name if enabled
    if (settings.useTextContent) {
        const content = (0, text_utils_1.getTextContent)(node).trim();
        if (content) {
            // Limit text content length to keep names manageable
            const truncatedContent = content.length > 30 ? `${content.substring(0, 30)}...` : content;
            nameParts.push(`"${truncatedContent}"`);
        }
    }
    // Include text color
    if (settings.includeTextColor && Array.isArray(node.fills) && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.type === 'SOLID' && fill.visible !== false) {
            const colorHex = (0, color_utils_1.colorToHex)(fill.color);
            nameParts.push(colorHex);
        }
    }
    // Include text style name
    if (settings.includeTextStyle) {
        const styleName = await (0, text_utils_1.getTextStyleName)(node);
        if (styleName) {
            nameParts.push(`Style: ${styleName}`);
        }
    }
    // Include opacity if less than 100%
    if (settings.includeTextOpacity && node.opacity < 1) {
        nameParts.push(`Opacity: ${Math.round(node.opacity * 100)}%`);
    }
    // Join all parts with separator
    const finalName = nameParts
        .filter(part => part !== null && part !== '')
        .join(' - ');
    return finalName || 'Text';
}
