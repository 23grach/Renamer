/**
 * Main renaming logic orchestrator for the Renamer plugin  
 */

import type { PluginSettings } from '../types';
import { isComponent, isContainerType } from '../utils/type-guards';
import { getLayerText } from '../utils/text-utils';
import { generateName } from './name-generator';

/**
 * Recursively renames nodes based on settings
 */
export async function renameNodeRecursively(node: SceneNode, settings: PluginSettings): Promise<void> {
  try {
    let shouldRecurse = false;
    
    // Skip renaming components themselves
    if (isComponent(node)) {
      // Only recurse into components if they can have children (are containers)
      shouldRecurse = 'children' in node && isContainerType(node.type);
    } else {
      // Generate and assign name for non-components
      const newName = await generateName(node, settings);
      
      // Only assign if the name actually changed
      if (newName !== node.name) {
        node.name = newName;
      }
      
      // Allow recursion for any node that can have children
      shouldRecurse = 'children' in node && isContainerType(node.type);
    }
    
    // Recurse into children if applicable and allowed
    if (shouldRecurse && 'children' in node) {
      // Ensure children exist and node is a valid container type before iterating
      if (Array.isArray(node.children)) {
        for (const child of node.children as SceneNode[]) {
          await renameNodeRecursively(child, settings);
        }
      }
    }
  } catch (error) {
    // Continue processing other nodes even if one fails
    console.error(`Error processing node ${node.id} (${node.name}):`, error);
  }
}

/**
 * Main function to rename selected layers
 */
export async function renameSelectedLayers(providedSettings?: PluginSettings): Promise<void> {
  try {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.notify('Please select at least one layer to rename.');
      return;
    }
    
    // Use provided settings or load from storage
    const settings = providedSettings || await figma.clientStorage.getAsync('settings') || {};
    
    let renamedCount = 0;
    const originalNames = new Map<string, string>();
    
    // Store original names
    selection.forEach(node => {
      originalNames.set(node.id, node.name);
    });
    
    // Rename recursively
    for (const node of selection) {
      await renameNodeRecursively(node, settings);
    }
    
    // Count actual changes on top-level selected items (excluding components)
    selection.forEach(node => {
      const originalName = originalNames.get(node.id);
      if (!isComponent(node) && node.name !== originalName) {
        renamedCount++;
      }
    });
    
    // Notify based on the count
    if (renamedCount > 0) {
      const layerText = getLayerText(renamedCount);
      figma.notify(`Renamed ${renamedCount} ${layerText}.`);
    } else {
      figma.notify('No selected layers required renaming with the current settings.');
    }
    
    // Only close plugin if we're not in settings mode
    if (!providedSettings) {
      figma.closePlugin();
    }
  } catch (error) {
    console.error('Error during layer renaming process:', error);
    figma.notify(
      'An error occurred during renaming. Check developer console for details.',
      { error: true, timeout: 6000 }
    );
    figma.closePlugin();
  }
} 