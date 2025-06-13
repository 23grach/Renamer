/**
 * Main name generation orchestrator for the Renamer plugin
 */

import type { PluginSettings } from '../types';
import { isShapeType, isContainerType } from '../utils/type-guards';
import { generateTextName } from '../name-generators/text-name-generator';
import { generateShapeName } from '../name-generators/shape-name-generator';
import { generateContainerName } from '../name-generators/container-name-generator';

/**
 * Main function to generate descriptive names for Figma nodes based on settings
 */
export async function generateName(node: SceneNode, settings: PluginSettings): Promise<string> {
  try {
    // Handle different node types based on settings
    if (node.type === 'TEXT' && settings.enableTextLayers) {
      return await generateTextName(node, settings);
    }
    
    if (isShapeType(node.type) && settings.enableFigures) {
      // Type assertion safe here because we've already checked the type
      const shapeNode = node as RectangleNode | EllipseNode | PolygonNode | StarNode | VectorNode | LineNode | BooleanOperationNode;
      return await generateShapeName(shapeNode, settings);
    }
    
    if (isContainerType(node.type) && settings.enableContainers) {
      // Type assertion safe here because we've already checked the type
      const containerNode = node as FrameNode | GroupNode;
      return await generateContainerName(containerNode, settings);
    }

    // Fallback to original name if node type is not handled or disabled
    return node.name;
  } catch (error) {
    // Return original name on error to prevent breaking the plugin
    return node.name;
  }
} 