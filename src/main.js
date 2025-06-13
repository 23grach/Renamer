"use strict";
/**
 * Main entry point for the Renamer Figma plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const renamer_1 = require("./core/renamer");
/**
 * Handles the 'settings' command - shows the UI and loads settings
 */
async function handleSettingsCommand() {
    // Load saved settings
    const savedSettings = await figma.clientStorage.getAsync('settings') || types_1.DEFAULT_SETTINGS;
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
figma.ui.onmessage = async (msg) => {
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
        }
        catch (error) {
            console.error('Error saving settings:', error);
            figma.notify('Error saving settings. Please try again.', { error: true });
        }
    }
    else if (msg.type === 'rename-with-settings') {
        try {
            // Rename layers with current settings from UI
            if (msg.settings) {
                await (0, renamer_1.renameSelectedLayers)(msg.settings);
            }
        }
        catch (error) {
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
    }
    else if (command === 'run') {
        await (0, renamer_1.renameSelectedLayers)();
    }
});
