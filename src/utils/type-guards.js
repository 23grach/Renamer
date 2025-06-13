"use strict";
/**
 * Type guard utilities for Figma nodes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isShapeType = isShapeType;
exports.isComponentType = isComponentType;
exports.isContainerType = isContainerType;
exports.isComponent = isComponent;
const types_1 = require("../types");
/**
 * Checks if a node type string is a valid ShapeType
 */
function isShapeType(type) {
    return types_1.SHAPE_TYPES.includes(type);
}
/**
 * Checks if a node type string is a valid ComponentType
 */
function isComponentType(type) {
    return types_1.COMPONENT_TYPES.includes(type);
}
/**
 * Checks if a node type string is a valid ContainerType
 */
function isContainerType(type) {
    return types_1.CONTAINER_TYPES.includes(type);
}
/**
 * Checks if a node is a Component, Component Set, or Instance
 */
function isComponent(node) {
    return isComponentType(node.type);
}
