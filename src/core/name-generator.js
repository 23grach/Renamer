"use strict";
/**
 * Main name generation orchestrator for the Renamer plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateName = generateName;
const type_guards_1 = require("../utils/type-guards");
const text_name_generator_1 = require("../name-generators/text-name-generator");
const shape_name_generator_1 = require("../name-generators/shape-name-generator");
const container_name_generator_1 = require("../name-generators/container-name-generator");
/**
 * Main function to generate descriptive names for Figma nodes based on settings
 */
async function generateName(node, settings) {
    try {
        // Handle different node types based on settings
        if (node.type === 'TEXT' && settings.enableTextLayers) {
            return await (0, text_name_generator_1.generateTextName)(node, settings);
        }
        if ((0, type_guards_1.isShapeType)(node.type) && settings.enableFigures) {
            // Type assertion safe here because we've already checked the type
            const shapeNode = node;
            return await (0, shape_name_generator_1.generateShapeName)(shapeNode, settings);
        }
        if ((0, type_guards_1.isContainerType)(node.type) && settings.enableContainers) {
            // Type assertion safe here because we've already checked the type
            const containerNode = node;
            return await (0, container_name_generator_1.generateContainerName)(containerNode, settings);
        }
        // Fallback to original name if node type is not handled or disabled
        return node.name;
    }
    catch (error) {
        // Return original name on error to prevent breaking the plugin
        return node.name;
    }
}
