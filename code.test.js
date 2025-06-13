"use strict";
/**
 * Comprehensive tests for Renamer Figma plugin
 * Tests all parameters and possible rename scenarios
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
// === MOCK SETUP ===
// Mock Figma API
const mockFigma = {
    getStyleByIdAsync: jest.fn(),
    currentPage: {
        selection: []
    },
    notify: jest.fn(),
    closePlugin: jest.fn(),
    clientStorage: {
        getAsync: jest.fn(),
        setAsync: jest.fn()
    },
    showUI: jest.fn(),
    ui: {
        postMessage: jest.fn(),
        onmessage: null
    },
    on: jest.fn()
};
global.figma = mockFigma;
// Mock HTML
global.__html__ = '<div>Mock UI</div>';
const DEFAULT_SETTINGS = {
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
// Import functions from the actual code file
Promise.resolve().then(() => __importStar(require('./code'))); // This will be available at runtime
// === MOCK NODE FACTORIES ===
/**
 * Creates a mock TextNode with customizable properties
 */
function createMockTextNode(options) {
    return {
        type: 'TEXT',
        name: options.name || 'Text',
        characters: options.characters || 'Sample Text',
        fills: options.fills || [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, visible: true }],
        textStyleId: options.textStyleId || '',
        fontSize: options.fontSize || 16,
        fontWeight: options.fontWeight || 400,
        opacity: options.opacity || 1,
        id: Math.random().toString()
    };
}
/**
 * Creates a mock ShapeNode (Rectangle) with customizable properties
 */
function createMockRectangleNode(options) {
    return {
        type: 'RECTANGLE',
        name: options.name || 'Rectangle',
        width: options.width || 100,
        height: options.height || 100,
        fills: options.fills || [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, visible: true }],
        strokes: options.strokes || [],
        strokeWeight: options.strokeWeight || 1,
        cornerRadius: options.cornerRadius || 0,
        opacity: options.opacity || 1,
        id: Math.random().toString()
    };
}
/**
 * Creates a mock EllipseNode with customizable properties
 */
function createMockEllipseNode(options) {
    return {
        type: 'ELLIPSE',
        name: options.name || 'Ellipse',
        width: options.width || 100,
        height: options.height || 100,
        fills: options.fills || [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }],
        opacity: options.opacity || 1,
        id: Math.random().toString()
    };
}
/**
 * Creates a mock FrameNode with customizable properties
 */
function createMockFrameNode(options) {
    return {
        type: 'FRAME',
        name: options.name || 'Frame',
        width: options.width || 200,
        height: options.height || 200,
        children: options.children || [],
        opacity: options.opacity || 1,
        id: Math.random().toString()
    };
}
/**
 * Creates a mock GroupNode with customizable properties
 */
function createMockGroupNode(options) {
    return {
        type: 'GROUP',
        name: options.name || 'Group',
        children: options.children || [],
        opacity: options.opacity || 1,
        id: Math.random().toString()
    };
}
// === UTILITY FUNCTION TESTS ===
describe('Type Guards', () => {
    test('isShapeType correctly identifies shape types', () => {
        const { isShapeType } = require('./code');
        expect(isShapeType('RECTANGLE')).toBe(true);
        expect(isShapeType('ELLIPSE')).toBe(true);
        expect(isShapeType('POLYGON')).toBe(true);
        expect(isShapeType('STAR')).toBe(true);
        expect(isShapeType('VECTOR')).toBe(true);
        expect(isShapeType('LINE')).toBe(true);
        expect(isShapeType('BOOLEAN_OPERATION')).toBe(true);
        expect(isShapeType('TEXT')).toBe(false);
        expect(isShapeType('FRAME')).toBe(false);
        expect(isShapeType('GROUP')).toBe(false);
    });
    test('isContainerType correctly identifies container types', () => {
        const { isContainerType } = require('./code');
        expect(isContainerType('FRAME')).toBe(true);
        expect(isContainerType('GROUP')).toBe(true);
        expect(isContainerType('TEXT')).toBe(false);
        expect(isContainerType('RECTANGLE')).toBe(false);
    });
    test('isComponentType correctly identifies component types', () => {
        const { isComponentType } = require('./code');
        expect(isComponentType('COMPONENT')).toBe(true);
        expect(isComponentType('COMPONENT_SET')).toBe(true);
        expect(isComponentType('INSTANCE')).toBe(true);
        expect(isComponentType('TEXT')).toBe(false);
        expect(isComponentType('FRAME')).toBe(false);
    });
});
describe('Color Utilities', () => {
    test('colorToHex converts RGB to hex correctly', () => {
        const { colorToHex } = require('./code');
        expect(colorToHex({ r: 1, g: 0, b: 0 })).toBe('#ff0000');
        expect(colorToHex({ r: 0, g: 1, b: 0 })).toBe('#00ff00');
        expect(colorToHex({ r: 0, g: 0, b: 1 })).toBe('#0000ff');
        expect(colorToHex({ r: 0.5, g: 0.5, b: 0.5 })).toBe('#808080');
        expect(colorToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
        expect(colorToHex({ r: 1, g: 1, b: 1 })).toBe('#ffffff');
    });
});
describe('Text Content Utilities', () => {
    test('getTextContent returns text for TEXT nodes', () => {
        const { getTextContent } = require('./code');
        const textNode = createMockTextNode({ characters: 'Hello World' });
        expect(getTextContent(textNode)).toBe('Hello World');
    });
    test('getTextContent returns empty string for non-TEXT nodes', () => {
        const { getTextContent } = require('./code');
        const rectNode = createMockRectangleNode({});
        expect(getTextContent(rectNode)).toBe('');
    });
    test('getElementsCountText formats counts correctly', () => {
        const { getElementsCountText } = require('./code');
        expect(getElementsCountText(1)).toBe('1 element');
        expect(getElementsCountText(2)).toBe('2 elements');
        expect(getElementsCountText(5)).toBe('5 elements');
        expect(getElementsCountText(10)).toBe('10 elements');
    });
    test('getLayerText formats layer count correctly', () => {
        const { getLayerText } = require('./code');
        expect(getLayerText(1)).toBe('layer');
        expect(getLayerText(2)).toBe('layers');
        expect(getLayerText(5)).toBe('layers');
    });
});
// === TEXT NODE NAMING TESTS ===
describe('Text Node Name Generation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFigma.getStyleByIdAsync.mockResolvedValue(null);
    });
    test('generateTextName with all text settings enabled', async () => {
        const { generateTextName } = require('./code');
        const textNode = createMockTextNode({
            characters: 'Button Text',
            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }],
            opacity: 0.8
        });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateTextName(textNode, settings);
        expect(result).toContain('"Button Text"');
        expect(result).toContain('#ff0000');
        expect(result).toContain('Opacity: 80%');
    });
    test('generateTextName with useTextContent disabled', async () => {
        const { generateTextName } = require('./code');
        const textNode = createMockTextNode({
            characters: 'Button Text',
            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }]
        });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { useTextContent: false });
        const result = await generateTextName(textNode, settings);
        expect(result).not.toContain('"Button Text"');
        expect(result).toContain('#ff0000');
    });
    test('generateTextName with includeTextColor disabled', async () => {
        const { generateTextName } = require('./code');
        const textNode = createMockTextNode({
            characters: 'Button Text',
            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }]
        });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { includeTextColor: false });
        const result = await generateTextName(textNode, settings);
        expect(result).toContain('"Button Text"');
        expect(result).not.toContain('#ff0000');
    });
    test('generateTextName with text style', async () => {
        const { generateTextName } = require('./code');
        mockFigma.getStyleByIdAsync.mockResolvedValue({ name: 'Heading 1' });
        const textNode = createMockTextNode({
            characters: 'Title',
            textStyleId: 'style123'
        });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateTextName(textNode, settings);
        expect(result).toContain('Style: Heading 1');
    });
    test('generateTextName with long text truncation', async () => {
        const { generateTextName } = require('./code');
        const longText = 'This is a very long text that should be truncated';
        const textNode = createMockTextNode({ characters: longText });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateTextName(textNode, settings);
        expect(result).toContain('...');
        expect(result.length).toBeLessThan(longText.length + 10);
    });
    test('generateTextName fallback when no content', async () => {
        const { generateTextName } = require('./code');
        const textNode = createMockTextNode({
            characters: '',
            fills: []
        });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateTextName(textNode, settings);
        expect(result).toBe('Text');
    });
});
// === SHAPE NODE NAMING TESTS ===
describe('Shape Node Name Generation', () => {
    test('generateShapeName for Rectangle with all settings', async () => {
        const { generateShapeName } = require('./code');
        const rectNode = createMockRectangleNode({
            width: 120,
            height: 80,
            fills: [{ type: 'SOLID', color: { r: 0, g: 0.5, b: 1 }, visible: true }],
            strokes: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }],
            strokeWeight: 2,
            cornerRadius: 8,
            opacity: 0.9
        });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateShapeName(rectNode, settings);
        expect(result).toContain('Rectangle');
        expect(result).toContain('120x80');
        expect(result).toContain('#0080ff');
        expect(result).toContain('Stroke: #ff0000 2px');
        expect(result).toContain('Radius: 8px');
        expect(result).toContain('Opacity: 90%');
    });
    test('generateShapeName for Circle detection', async () => {
        const { generateShapeName } = require('./code');
        const circleNode = createMockEllipseNode({
            width: 100,
            height: 100
        });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateShapeName(circleNode, settings);
        expect(result).toContain('Circle');
    });
    test('generateShapeName for Ellipse detection', async () => {
        const { generateShapeName } = require('./code');
        const ellipseNode = createMockEllipseNode({
            width: 150,
            height: 100
        });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateShapeName(ellipseNode, settings);
        expect(result).toContain('Ellipse');
    });
    test('generateShapeName with includeShapeType disabled', async () => {
        const { generateShapeName } = require('./code');
        const rectNode = createMockRectangleNode({});
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { includeShapeType: false });
        const result = await generateShapeName(rectNode, settings);
        expect(result).not.toContain('Rectangle');
    });
    test('generateShapeName with includeShapeSize disabled', async () => {
        const { generateShapeName } = require('./code');
        const rectNode = createMockRectangleNode({ width: 120, height: 80 });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { includeShapeSize: false });
        const result = await generateShapeName(rectNode, settings);
        expect(result).not.toContain('120x80');
    });
    test('generateShapeName with includeFillColor disabled', async () => {
        const { generateShapeName } = require('./code');
        const rectNode = createMockRectangleNode({
            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }]
        });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { includeFillColor: false });
        const result = await generateShapeName(rectNode, settings);
        expect(result).not.toContain('#ff0000');
    });
    test('generateShapeName with no fills', async () => {
        const { generateShapeName } = require('./code');
        const rectNode = createMockRectangleNode({ fills: [] });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateShapeName(rectNode, settings);
        expect(result).toContain('Rectangle');
    });
    test('generateShapeName fallback when no content', async () => {
        const { generateShapeName } = require('./code');
        const rectNode = createMockRectangleNode({});
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { includeShapeType: false, includeShapeSize: false, includeFillColor: false, includeStrokeSettings: false, includeCornerRadius: false, includeFigureOpacity: false });
        const result = await generateShapeName(rectNode, settings);
        expect(result).toBe('Shape');
    });
});
// === CONTAINER NODE NAMING TESTS ===
describe('Container Node Name Generation', () => {
    test('generateContainerName for Frame with all settings', async () => {
        const { generateContainerName } = require('./code');
        const textChild = createMockTextNode({ characters: 'Header Text' });
        const frameNode = createMockFrameNode({
            width: 300,
            height: 200,
            children: [textChild],
            opacity: 0.95
        });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateContainerName(frameNode, settings);
        expect(result).toContain('"Header Text"');
        expect(result).toContain('Frame');
        expect(result).toContain('300x200');
        expect(result).toContain('1 element');
        expect(result).toContain('Opacity: 95%');
    });
    test('generateContainerName for Group with multiple children', async () => {
        const { generateContainerName } = require('./code');
        const child1 = createMockTextNode({ characters: 'Text 1' });
        const child2 = createMockRectangleNode({});
        const child3 = createMockEllipseNode({});
        const groupNode = createMockGroupNode({
            children: [child1, child2, child3]
        });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateContainerName(groupNode, settings);
        expect(result).toContain('Group');
        expect(result).toContain('3 elements');
    });
    test('generateContainerName with useFirstTextContent disabled', async () => {
        const { generateContainerName } = require('./code');
        const textChild = createMockTextNode({ characters: 'Header Text' });
        const frameNode = createMockFrameNode({ children: [textChild] });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { useFirstTextContent: false });
        const result = await generateContainerName(frameNode, settings);
        expect(result).not.toContain('"Header Text"');
        expect(result).toContain('Frame');
    });
    test('generateContainerName with includeContainerType disabled', async () => {
        const { generateContainerName } = require('./code');
        const frameNode = createMockFrameNode({});
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { includeContainerType: false });
        const result = await generateContainerName(frameNode, settings);
        expect(result).not.toContain('Frame');
    });
    test('generateContainerName with includeContainerSize disabled', async () => {
        const { generateContainerName } = require('./code');
        const frameNode = createMockFrameNode({ width: 300, height: 200 });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { includeContainerSize: false });
        const result = await generateContainerName(frameNode, settings);
        expect(result).not.toContain('300x200');
    });
    test('generateContainerName with includeChildrenCount disabled', async () => {
        const { generateContainerName } = require('./code');
        const child = createMockTextNode({});
        const frameNode = createMockFrameNode({ children: [child] });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { includeChildrenCount: false });
        const result = await generateContainerName(frameNode, settings);
        expect(result).not.toContain('element');
    });
    test('generateContainerName with long text truncation', async () => {
        const { generateContainerName } = require('./code');
        const longText = 'This is a very long header text that should be truncated';
        const textChild = createMockTextNode({ characters: longText });
        const frameNode = createMockFrameNode({ children: [textChild] });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateContainerName(frameNode, settings);
        expect(result).toContain('...');
    });
    test('generateContainerName fallback when no content', async () => {
        const { generateContainerName } = require('./code');
        const frameNode = createMockFrameNode({});
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { useFirstTextContent: false, includeContainerType: false, includeContainerSize: false, includeChildrenCount: false, includeContainerOpacity: false });
        const result = await generateContainerName(frameNode, settings);
        expect(result).toBe('Frame');
    });
});
// === MAIN GENERATION FUNCTION TESTS ===
describe('Main generateName Function', () => {
    test('generateName routes to correct generator for TEXT node', async () => {
        const { generateName } = require('./code');
        const textNode = createMockTextNode({ characters: 'Test Text' });
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateName(textNode, settings);
        expect(result).toContain('"Test Text"');
    });
    test('generateName routes to correct generator for RECTANGLE node', async () => {
        const { generateName } = require('./code');
        const rectNode = createMockRectangleNode({});
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateName(rectNode, settings);
        expect(result).toContain('Rectangle');
    });
    test('generateName routes to correct generator for FRAME node', async () => {
        const { generateName } = require('./code');
        const frameNode = createMockFrameNode({});
        const settings = Object.assign({}, DEFAULT_SETTINGS);
        const result = await generateName(frameNode, settings);
        expect(result).toContain('Frame');
    });
    test('generateName returns original name when TEXT disabled', async () => {
        const { generateName } = require('./code');
        const textNode = createMockTextNode({ name: 'Original Text' });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { enableTextLayers: false });
        const result = await generateName(textNode, settings);
        expect(result).toBe('Original Text');
    });
    test('generateName returns original name when FIGURES disabled', async () => {
        const { generateName } = require('./code');
        const rectNode = createMockRectangleNode({ name: 'Original Rectangle' });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { enableFigures: false });
        const result = await generateName(rectNode, settings);
        expect(result).toBe('Original Rectangle');
    });
    test('generateName returns original name when CONTAINERS disabled', async () => {
        const { generateName } = require('./code');
        const frameNode = createMockFrameNode({ name: 'Original Frame' });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { enableContainers: false });
        const result = await generateName(frameNode, settings);
        expect(result).toBe('Original Frame');
    });
});
// === SETTINGS VARIATIONS TESTS ===
describe('Settings Combinations', () => {
    test('All text settings enabled produces complete name', async () => {
        const { generateTextName } = require('./code');
        const textNode = createMockTextNode({
            characters: 'Button',
            fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 1 }, visible: true }],
            opacity: 0.8
        });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { useTextContent: true, includeTextColor: true, includeTextStyle: true, includeTextOpacity: true });
        const result = await generateTextName(textNode, settings);
        expect(result).toContain('"Button"');
        expect(result).toContain('#0000ff');
        expect(result).toContain('Opacity: 80%');
    });
    test('All shape settings enabled produces complete name', async () => {
        const { generateShapeName } = require('./code');
        const rectNode = createMockRectangleNode({
            width: 100,
            height: 50,
            fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 0 }, visible: true }],
            cornerRadius: 4,
            opacity: 0.9
        });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { includeShapeType: true, includeShapeSize: true, includeFillColor: true, includeCornerRadius: true, includeFigureOpacity: true });
        const result = await generateShapeName(rectNode, settings);
        expect(result).toContain('Rectangle');
        expect(result).toContain('100x50');
        expect(result).toContain('#ffff00');
        expect(result).toContain('Radius: 4px');
        expect(result).toContain('Opacity: 90%');
    });
    test('All container settings enabled produces complete name', async () => {
        const { generateContainerName } = require('./code');
        const textChild = createMockTextNode({ characters: 'Card Title' });
        const frameNode = createMockFrameNode({
            width: 250,
            height: 150,
            children: [textChild],
            opacity: 0.95
        });
        const settings = Object.assign(Object.assign({}, DEFAULT_SETTINGS), { useFirstTextContent: true, includeContainerType: true, includeContainerSize: true, includeChildrenCount: true, includeContainerOpacity: true });
        const result = await generateContainerName(frameNode, settings);
        expect(result).toContain('"Card Title"');
        expect(result).toContain('Frame');
        expect(result).toContain('250x150');
        expect(result).toContain('1 element');
        expect(result).toContain('Opacity: 95%');
    });
    test('Minimal settings produce basic names', async () => {
        const { generateTextName, generateShapeName, generateContainerName } = require('./code');
        const minimalSettings = {
            enableTextLayers: true,
            useTextContent: false,
            includeTextColor: false,
            includeTextStyle: false,
            includeTextOpacity: false,
            enableContainers: true,
            includeContainerType: false,
            includeContainerSize: false,
            includeChildrenCount: false,
            includeContainerOpacity: false,
            useFirstTextContent: false,
            useAutoLayoutNames: false,
            enableFigures: true,
            includeShapeType: false,
            includeShapeSize: false,
            includeFillColor: false,
            includeStrokeSettings: false,
            includeCornerRadius: false,
            includeFigureOpacity: false
        };
        const textResult = await generateTextName(createMockTextNode({}), minimalSettings);
        const shapeResult = await generateShapeName(createMockRectangleNode({}), minimalSettings);
        const containerResult = await generateContainerName(createMockFrameNode({}), minimalSettings);
        expect(textResult).toBe('Text');
        expect(shapeResult).toBe('Shape');
        expect(containerResult).toBe('Frame');
    });
});
// === EDGE CASES AND ERROR HANDLING ===
describe('Edge Cases and Error Handling', () => {
    test('Handles nodes with null/undefined properties', async () => {
        const { generateName } = require('./code');
        const brokenNode = {
            type: 'TEXT',
            name: 'Broken Text',
            characters: null,
            fills: undefined,
            opacity: undefined
        };
        const result = await generateName(brokenNode, DEFAULT_SETTINGS);
        expect(typeof result).toBe('string');
    });
    test('Handles empty arrays and objects', async () => {
        const { generateContainerName } = require('./code');
        const emptyFrame = createMockFrameNode({ children: [] });
        const result = await generateContainerName(emptyFrame, DEFAULT_SETTINGS);
        expect(result).toContain('Frame');
        expect(result).toContain('0 elements');
    });
    test('Handles invisible fills', async () => {
        const { generateShapeName } = require('./code');
        const rectNode = createMockRectangleNode({
            fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: false }]
        });
        const result = await generateShapeName(rectNode, DEFAULT_SETTINGS);
        expect(result).not.toContain('#ff0000');
    });
    test('Handles gradient fills', async () => {
        const { generateShapeName } = require('./code');
        const rectNode = createMockRectangleNode({
            fills: [{ type: 'GRADIENT_LINEAR', visible: true }]
        });
        const result = await generateShapeName(rectNode, DEFAULT_SETTINGS);
        expect(result).toContain('Rectangle');
    });
    test('Handles mixed corner radius', async () => {
        const { formatCornerRadius } = require('./code');
        const nodeWithMixedRadius = {
            cornerRadius: {},
            topLeftRadius: 4,
            topRightRadius: 8,
            bottomRightRadius: 4,
            bottomLeftRadius: 8
        };
        const result = formatCornerRadius(nodeWithMixedRadius);
        expect(result).toContain('Radius:');
    });
});
// === INTEGRATION TESTS ===
describe('Plugin Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFigma.currentPage.selection = [];
        mockFigma.clientStorage.getAsync.mockResolvedValue(DEFAULT_SETTINGS);
    });
    test('renameSelectedLayers handles empty selection', async () => {
        const { renameSelectedLayers } = require('./code');
        await renameSelectedLayers();
        expect(mockFigma.notify).toHaveBeenCalledWith('Please select at least one layer to rename.');
    });
    test('renameSelectedLayers processes selected nodes', async () => {
        const { renameSelectedLayers } = require('./code');
        const textNode = createMockTextNode({ characters: 'Test', name: 'Old Name' });
        mockFigma.currentPage.selection = [textNode];
        await renameSelectedLayers(DEFAULT_SETTINGS);
        expect(textNode.name).not.toBe('Old Name');
        expect(mockFigma.notify).toHaveBeenCalledWith(expect.stringContaining('Renamed'));
    });
    test('Settings command shows UI', async () => {
        const { handleSettingsCommand } = require('./code');
        await handleSettingsCommand();
        expect(mockFigma.showUI).toHaveBeenCalled();
        expect(mockFigma.ui.postMessage).toHaveBeenCalledWith(expect.objectContaining({
            type: 'load-settings'
        }));
    });
});
