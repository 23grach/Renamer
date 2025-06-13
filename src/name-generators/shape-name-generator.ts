/**
 * Shape name generation logic for the Renamer plugin
 */

import type { PluginSettings, ShapeNode } from '../types';
import { getShapeName, getShapeInfo, formatCornerRadius } from '../utils/shape-utils';
import { getFillInfo, getStrokeInfo } from '../utils/color-utils';

/**
 * Generates a descriptive name for shape nodes
 */
export async function generateShapeName(node: ShapeNode, settings: PluginSettings): Promise<string> {
  const nameParts: string[] = [];

  // Include shape type
  if (settings.includeShapeType) {
    const shapeName = getShapeName(node);
    nameParts.push(shapeName);
  }

  // Include shape size
  if (settings.includeShapeSize) {
    const { dimensions } = getShapeInfo(node);
    if (dimensions) nameParts.push(dimensions);
  }

  // Fill color
  if (settings.includeFillColor) {
    const fillInfo = getFillInfo(node, settings);
    if (fillInfo) nameParts.push(fillInfo);
  }

  // Stroke settings
  if (settings.includeStrokeSettings) {
    const strokeInfo = getStrokeInfo(node, settings);
    if (strokeInfo) nameParts.push(strokeInfo);
  }

  // Corner radius
  if (settings.includeCornerRadius) {
    const radiusInfo = formatCornerRadius(node);
    if (radiusInfo) nameParts.push(radiusInfo);
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