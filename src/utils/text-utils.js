"use strict";
/**
 * Text processing utilities for the Renamer plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextContent = getTextContent;
exports.findHeaderText = findHeaderText;
exports.findFirstTextContent = findFirstTextContent;
exports.getElementsCountText = getElementsCountText;
exports.getLayerText = getLayerText;
exports.getTextStyleName = getTextStyleName;
/**
 * Gets the text content from a TextNode
 */
function getTextContent(node) {
    return node.type === 'TEXT' ? node.characters : '';
}
/**
 * Finds the most prominent text node within a list of nodes, considered as a header.
 * Prominence is determined by font weight first, then font size.
 */
function findHeaderText(nodes) {
    const textNodes = nodes.filter((node) => node.type === 'TEXT');
    if (textNodes.length === 0)
        return '';
    return textNodes.reduce((headerNode, currentNode) => {
        const currentFontSize = typeof currentNode.fontSize === 'number' ? currentNode.fontSize : 0;
        const headerFontSize = typeof headerNode.fontSize === 'number' ? headerNode.fontSize : 0;
        const currentFontWeight = typeof currentNode.fontWeight === 'number' ? currentNode.fontWeight : 400;
        const headerFontWeight = typeof headerNode.fontWeight === 'number' ? headerNode.fontWeight : 400;
        return (currentFontWeight > headerFontWeight ||
            (currentFontWeight === headerFontWeight && currentFontSize > headerFontSize))
            ? currentNode
            : headerNode;
    }).characters;
}
/**
 * Finds the first text content from a list of nodes
 */
function findFirstTextContent(nodes) {
    for (const node of nodes) {
        const textContent = getTextContent(node);
        if (textContent.trim())
            return textContent.trim();
    }
    return '';
}
/**
 * Returns the grammatically correct plural form for "element" based on the count.
 * Handles Russian pluralization rules for 1, 2-4, and 5+ elements.
 */
function getElementsCountText(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastDigit === 1 && lastTwoDigits !== 11) {
        return `${count} element`;
    }
    else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
        return `${count} elements`;
    }
    else {
        return `${count} elements`;
    }
}
/**
 * Returns the grammatically correct singular or plural form of "layer"
 */
function getLayerText(count) {
    return count === 1 ? 'layer' : 'layers';
}
/**
 * Gets the text style name for a text node
 */
async function getTextStyleName(node) {
    try {
        if (node.textStyleId && typeof node.textStyleId === 'string' && node.textStyleId !== '') {
            const style = await figma.getStyleByIdAsync(node.textStyleId);
            return style ? style.name : null;
        }
        return null;
    }
    catch (error) {
        return null;
    }
}
