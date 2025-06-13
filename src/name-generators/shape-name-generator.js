"use strict";
/**
 * Shape name generation logic for the Renamer plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShapeName = generateShapeName;
const shape_utils_1 = require("../utils/shape-utils");
const color_utils_1 = require("../utils/color-utils");
/**
 * Generates a descriptive name for shape nodes
 */
async function generateShapeName(node, settings) {
    const nameParts = [];
    // Include shape type
    if (settings.includeShapeType) {
        const shapeName = (0, shape_utils_1.getShapeName)(node);
        nameParts.push(shapeName);
    }
    // Include shape size
    if (settings.includeShapeSize) {
        const { dimensions } = (0, shape_utils_1.getShapeInfo)(node);
        if (dimensions)
            nameParts.push(dimensions);
    }
    // Fill color
    if (settings.includeFillColor) {
        const fillInfo = (0, color_utils_1.getFillInfo)(node, settings);
        if (fillInfo)
            nameParts.push(fillInfo);
    }
    // Stroke settings
    if (settings.includeStrokeSettings) {
        const strokeInfo = (0, color_utils_1.getStrokeInfo)(node, settings);
        if (strokeInfo)
            nameParts.push(strokeInfo);
    }
    // Corner radius
    if (settings.includeCornerRadius) {
        const radiusInfo = (0, shape_utils_1.formatCornerRadius)(node);
        if (radiusInfo)
            nameParts.push(radiusInfo);
    }
    // Opacity
    if (settings.includeFigureOpacity && node.opacity < 1) {
        nameParts.push(`Opacity: ${Math.round(node.opacity * 100)}%`);
    }
    // Join all parts with separator
    const finalName = nameParts
        .filter(part => part !== null && part !== '')
        .join(' - ');
    return finalName || 'Shape';
}
