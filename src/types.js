"use strict";
/**
 * Type definitions for the Renamer Figma plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SETTINGS = exports.CONTAINER_TYPES = exports.COMPONENT_TYPES = exports.SHAPE_TYPES = void 0;
// Node type constants
exports.SHAPE_TYPES = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE', 'BOOLEAN_OPERATION'];
exports.COMPONENT_TYPES = ['COMPONENT', 'COMPONENT_SET', 'INSTANCE'];
exports.CONTAINER_TYPES = ['FRAME', 'GROUP'];
// Default settings
exports.DEFAULT_SETTINGS = {
    // Text Layers
    enableTextLayers: true,
    useTextContent: true,
    includeTextColor: true,
    includeTextStyle: true,
    includeTextOpacity: true,
    // Containers
    enableContainers: true,
    includeContainerType: true,
    includeContainerSize: true,
    includeChildrenCount: true,
    includeContainerOpacity: true,
    useFirstTextContent: true,
    useAutoLayoutNames: true,
    // Figures
    enableFigures: true,
    includeShapeType: true,
    includeShapeSize: true,
    includeFillColor: true,
    includeStrokeSettings: true,
    includeCornerRadius: true,
    includeFigureOpacity: true
};
