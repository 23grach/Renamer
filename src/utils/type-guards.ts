/**
 * Type guard utilities for Figma nodes
 */

import { SHAPE_TYPES, COMPONENT_TYPES, CONTAINER_TYPES } from '../types';
import type { ShapeType, ComponentType, ContainerType } from '../types';

/**
 * Checks if a node type string is a valid ShapeType
 */
export function isShapeType(type: string): type is ShapeType {
  return (SHAPE_TYPES as readonly string[]).includes(type);
}

/**
 * Checks if a node type string is a valid ComponentType
 */
export function isComponentType(type: string): type is ComponentType {
  return (COMPONENT_TYPES as readonly string[]).includes(type);
}

/**
 * Checks if a node type string is a valid ContainerType
 */
export function isContainerType(type: string): type is ContainerType {
  return (CONTAINER_TYPES as readonly string[]).includes(type);
}

/**
 * Checks if a node is a Component, Component Set, or Instance
 */
export function isComponent(node: SceneNode): boolean {
  return isComponentType(node.type);
} 