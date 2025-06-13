/**
 * Type definitions for the Renamer Figma plugin
 */

// Node type constants
export const SHAPE_TYPES = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE', 'BOOLEAN_OPERATION'] as const;
export const COMPONENT_TYPES = ['COMPONENT', 'COMPONENT_SET', 'INSTANCE'] as const;
export const CONTAINER_TYPES = ['FRAME', 'GROUP'] as const;

// Derived types
export type ShapeType = typeof SHAPE_TYPES[number];
export type ComponentType = typeof COMPONENT_TYPES[number];
export type ContainerType = typeof CONTAINER_TYPES[number];

// Node type aliases
export type ShapeNode = RectangleNode | EllipseNode | PolygonNode | StarNode | VectorNode | LineNode | BooleanOperationNode;
export type ContainerNode = FrameNode | GroupNode;

// Plugin settings interface
export interface PluginSettings {
  // Text Layers
  enableTextLayers: boolean;
  useTextContent: boolean;
  includeTextColor: boolean;
  includeTextStyle: boolean;
  includeTextOpacity: boolean;

  // Containers
  enableContainers: boolean;
  includeContainerType: boolean;
  includeContainerSize: boolean;
  includeChildrenCount: boolean;
  includeContainerOpacity: boolean;
  useFirstTextContent: boolean;
  useAutoLayoutNames: boolean;

  // Figures
  enableFigures: boolean;
  includeShapeType: boolean;
  includeShapeSize: boolean;
  includeFillColor: boolean;
  includeStrokeSettings: boolean;
  includeCornerRadius: boolean;
  includeFigureOpacity: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: PluginSettings = {
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
} as const;

// UI Message types
export interface UIMessage {
  type: 'save-settings' | 'rename-with-settings' | 'load-settings';
  settings?: PluginSettings;
  previousStates?: Record<string, unknown>;
}

// Shape info interface
export interface ShapeInfo {
  colorHex: string;
  dimensions: string;
} 