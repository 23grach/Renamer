/**
 * Shape processing utilities for the Renamer plugin
 */

import type { ShapeNode, ShapeInfo } from '../types';

/**
 * Extracts color (if solid fill) and dimensions from a shape node
 */
export function getShapeInfo(node: ShapeNode): ShapeInfo {
  const colorHex = Array.isArray(node.fills) && 
    node.fills.length > 0 && 
    node.fills[0].type === 'SOLID' && 
    node.fills[0].visible !== false
    ? `#${Object.values(node.fills[0].color)
        .map((c: unknown) => typeof c === 'number' ? Math.round(c * 255).toString(16).padStart(2, '0') : '00')
        .join('')}`
    : '';

  const dimensions = 'width' in node && 'height' in node
    ? `${Math.round(node.width)}x${Math.round(node.height)}`
    : '';

  return { colorHex, dimensions };
}

/**
 * Determines a descriptive name for a shape node (e.g., "Rectangle", "Circle", "Vector").
 * Differentiates between Ellipse and Circle based on dimensions.
 */
export function getShapeName(node: ShapeNode): string {
  switch (node.type) {
    case 'RECTANGLE':
      return 'Rectangle';
    case 'ELLIPSE':
      // Check if it's a perfect circle
      if ('width' in node && 'height' in node && Math.abs(node.width - node.height) < 1) {
        return 'Circle';
      }
      return 'Ellipse';
    case 'POLYGON':
      return 'Polygon';
    case 'STAR':
      return 'Star';
    case 'VECTOR':
      return 'Vector';
    case 'LINE':
      return 'Line';
    case 'BOOLEAN_OPERATION':
      return 'Boolean';
    default:
      return 'Shape';
  }
}

/**
 * Formats corner radius information for a node
 */
export function formatCornerRadius(node: SceneNode): string | null {
  if (!('cornerRadius' in node)) return null;

  const radius = node.cornerRadius;
  
  if (typeof radius === 'number' && radius > 0) {
    return `Radius: ${Math.round(radius)}px`;
  }

  // Handle mixed corner radius for nodes that support it
  if (typeof radius === 'object' && radius !== null) {
    if ('topLeftRadius' in node && 'topRightRadius' in node && 'bottomRightRadius' in node && 'bottomLeftRadius' in node) {
      const corners = [
        node.topLeftRadius,
        node.topRightRadius,
        node.bottomRightRadius,
        node.bottomLeftRadius
      ].filter((r): r is number => typeof r === 'number' && r > 0);

      if (corners.length > 0) {
        const uniqueCorners = [...new Set(corners)];
        if (uniqueCorners.length === 1) {
          return `Radius: ${Math.round(uniqueCorners[0])}px`;
        } else {
          return `Radius: ${corners.map(r => Math.round(r)).join('/')}px`;
        }
      }
    }
  }

  return null;
} 