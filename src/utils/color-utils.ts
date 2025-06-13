/**
 * Color processing utilities for the Renamer plugin
 */

import type { PluginSettings } from '../types';

/**
 * Converts RGB color to hex string
 */
export function colorToHex(color: RGB): string {
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Gets fill information from a shape node
 */
export function getFillInfo(node: SceneNode, _settings: PluginSettings): string | null {
  if (!('fills' in node) || !Array.isArray(node.fills) || node.fills.length === 0) {
    return null;
  }

  const fill = node.fills[0];
  if (fill.type === 'SOLID' && fill.visible !== false) {
    return colorToHex(fill.color);
  }

  return null;
}

/**
 * Gets stroke information from a shape node
 */
export function getStrokeInfo(node: SceneNode, _settings: PluginSettings): string | null {
  if (!('strokes' in node) || !Array.isArray(node.strokes) || node.strokes.length === 0) {
    return null;
  }

  const stroke = node.strokes[0];
  if (stroke.type === 'SOLID' && stroke.visible !== false) {
    const strokeColor = colorToHex(stroke.color);
    const strokeWeight = ('strokeWeight' in node && typeof node.strokeWeight === 'number') 
      ? Math.round(node.strokeWeight) 
      : 1;
    return `Stroke: ${strokeColor} ${strokeWeight}px`;
  }

  return null;
} 