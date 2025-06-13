"use strict";
/**
 * Container name generation logic for the Renamer plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContainerName = generateContainerName;
const text_utils_1 = require("../utils/text-utils");
const container_utils_1 = require("../utils/container-utils");
/**
 * Generates a descriptive name for container nodes (Frames, Groups)
 */
async function generateContainerName(node, settings) {
    const nameParts = [];
    // Try to use header text from children first
    if (settings.useFirstTextContent) {
        const headerText = (0, text_utils_1.findHeaderText)(node.children);
        if (headerText) {
            const truncatedText = headerText.length > 30 ? `${headerText.substring(0, 30)}...` : headerText;
            nameParts.push(`"${truncatedText}"`);
        }
        else {
            // Try to find text content from first text node
            const firstTextContent = (0, text_utils_1.findFirstTextContent)(node.children);
            if (firstTextContent) {
                const truncatedText = firstTextContent.length > 30 ? `${firstTextContent.substring(0, 30)}...` : firstTextContent;
                nameParts.push(`"${truncatedText}"`);
            }
            else if (settings.useAutoLayoutNames) {
                // Try to find header from child container
                const childHeaderText = (0, container_utils_1.findHeaderFromChild)(node);
                if (childHeaderText) {
                    const truncatedText = childHeaderText.length > 30 ? `${childHeaderText.substring(0, 30)}...` : childHeaderText;
                    nameParts.push(`"${truncatedText}"`);
                }
            }
        }
    }
    // Include container type
    if (settings.includeContainerType) {
        const containerType = node.type === 'FRAME' ? 'Frame' : 'Group';
        nameParts.push(containerType);
    }
    // Include container size
    if (settings.includeContainerSize && 'width' in node && 'height' in node) {
        const dimensions = `${Math.round(node.width)}x${Math.round(node.height)}`;
        nameParts.push(dimensions);
    }
    // Include children count
    if (settings.includeChildrenCount) {
        const childrenCount = node.children.length;
        const elementsText = (0, text_utils_1.getElementsCountText)(childrenCount);
        nameParts.push(elementsText);
    }
    // Include opacity if less than 100%
    if (settings.includeContainerOpacity && node.opacity < 1) {
        nameParts.push(`Opacity: ${Math.round(node.opacity * 100)}%`);
    }
    // Join all parts with separator
    const finalName = nameParts
        .filter(part => part !== null && part !== '')
        .join(' - ');
    return finalName || (node.type === 'FRAME' ? 'Frame' : 'Group');
}
