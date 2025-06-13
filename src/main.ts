/**
 * Main entry point for the Renamer Figma plugin
 */

import type { UIMessage } from './types';
import { DEFAULT_SETTINGS } from './types';
import { renameSelectedLayers } from './core/renamer';

/**
 * Handles the 'settings' command - shows the UI and loads settings
 */
async function handleSettingsCommand(): Promise<void> {
  // Load saved settings
  const savedSettings = await figma.clientStorage.getAsync('settings') || DEFAULT_SETTINGS;
  const savedPreviousStates = await figma.clientStorage.getAsync('previousStates') || {};
  
  figma.showUI(__html__, { width: 300, height: 640 });
  
  // Send saved settings to UI
  figma.ui.postMessage({ 
    type: 'load-settings',
    settings: savedSettings,
    previousStates: savedPreviousStates
  });
}

/**
 * Handles messages from the UI
 */
figma.ui.onmessage = async (msg: UIMessage) => {
  if (msg.type === 'save-settings') {
    try {
      // Save settings to client storage
      if (msg.settings) {
        await figma.clientStorage.setAsync('settings', msg.settings);
      }
      
      // Save previousStates to client storage
      if (msg.previousStates) {
        await figma.clientStorage.setAsync('previousStates', msg.previousStates);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      figma.notify('Error saving settings. Please try again.', { error: true });
    }
  } else if (msg.type === 'rename-with-settings') {
    try {
      // Rename layers with current settings from UI
      if (msg.settings) {
        await renameSelectedLayers(msg.settings);
      }
    } catch (error) {
      console.error('Error during rename:', error);
      figma.notify('Error during renaming. Check console for details.', { error: true });
    }
  }
};

/**
 * Handle menu commands
 */
figma.on('run', async ({ command }) => {
  if (command === 'settings') {
    await handleSettingsCommand();
  } else if (command === 'run') {
    await renameSelectedLayers();
  }
}); 