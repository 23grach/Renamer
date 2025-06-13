/**
 * Container processing utilities for the Renamer plugin
 */

import type { ContainerNode } from '../types';
import { isContainerType } from './type-guards';
import { findHeaderText } from './text-utils';

/**
 * Attempts to find a header text from a direct child container if there's only one
 */
export function findHeaderFromChild(parentNode: ContainerNode): string {
  const childContainers = parentNode.children.filter((child): child is ContainerNode =>
    isContainerType(child.type)
  );
  
  if (childContainers.length === 1) {
    const childHeaderText = findHeaderText(childContainers[0].children);
    if (childHeaderText) return childHeaderText;
  }
  
  return '';
} 