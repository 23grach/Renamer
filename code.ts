/**
 * Main code for the Renamer Figma plugin
 * This file provides access to the figma document via the figma global object
 */

// === TYPE DEFINITIONS ===

// Node type constants
const SHAPE_TYPES = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE', 'BOOLEAN_OPERATION'] as const;
const COMPONENT_TYPES = ['COMPONENT', 'COMPONENT_SET', 'INSTANCE'] as const;
const CONTAINER_TYPES = ['FRAME', 'GROUP'] as const;

// Derived types
type ShapeType = typeof SHAPE_TYPES[number];
type ComponentType = typeof COMPONENT_TYPES[number];
type ContainerType = typeof CONTAINER_TYPES[number];

// Node type aliases
type ShapeNode = RectangleNode | EllipseNode | PolygonNode | StarNode | VectorNode | LineNode | BooleanOperationNode;
type ContainerNode = FrameNode | GroupNode;

// Plugin settings interface
interface PluginSettings {
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
const DEFAULT_SETTINGS: PluginSettings = {
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
interface UIMessage {
  type: 'save-settings' | 'rename-with-settings' | 'load-settings';
  settings?: PluginSettings;
  previousStates?: Record<string, unknown>;
}

// === TYPE GUARDS ===

/**
 * Checks if a node type string is a valid ShapeType
 */
function isShapeType(type: string): type is ShapeType {
  return (SHAPE_TYPES as readonly string[]).includes(type);
}

/**
 * Checks if a node type string is a valid ComponentType
 */
function isComponentType(type: string): type is ComponentType {
  return (COMPONENT_TYPES as readonly string[]).includes(type);
}

/**
 * Checks if a node type string is a valid ContainerType
 */
function isContainerType(type: string): type is ContainerType {
  return (CONTAINER_TYPES as readonly string[]).includes(type);
}

/**
 * Checks if a node is a Component, Component Set, or Instance
 */
function isComponent(node: SceneNode): boolean {
  return isComponentType(node.type);
}

// === UTILITY FUNCTIONS ===

/**
 * Gets the text content from a TextNode
 */
function getTextContent(node: SceneNode): string {
  return node.type === 'TEXT' ? node.characters : '';
}

/**
 * Finds the most prominent text node within a list of nodes, considered as a header.
 * Prominence is determined by font weight first, then font size.
 */
function findHeaderText(nodes: readonly SceneNode[]): string {
  const textNodes = nodes.filter((node): node is TextNode => node.type === 'TEXT');
  
  if (textNodes.length === 0) return '';
  
  return textNodes.reduce((headerNode, currentNode) => {
    const currentFontSize = typeof currentNode.fontSize === 'number' ? currentNode.fontSize : 0;
    const headerFontSize = typeof headerNode.fontSize === 'number' ? headerNode.fontSize : 0;
    const currentFontWeight = typeof currentNode.fontWeight === 'number' ? currentNode.fontWeight : 400;
    const headerFontWeight = typeof headerNode.fontWeight === 'number' ? headerNode.fontWeight : 400;
    
    return (currentFontWeight > headerFontWeight || 
            (currentFontWeight === headerFontWeight && currentFontSize > headerFontSize))
      ? currentNode
      : headerNode;
  }).characters;
}

/**
 * Finds the first text content from a list of nodes
 */
function findFirstTextContent(nodes: readonly SceneNode[]): string {
  for (const node of nodes) {
    const textContent = getTextContent(node);
    if (textContent.trim()) return textContent.trim();
  }
  return '';
}

/**
 * Returns the grammatically correct plural form for "element" based on the count.
 * Handles Russian pluralization rules for 1, 2-4, and 5+ elements.
 */
function getElementsCountText(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${count} element`;
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return `${count} elements`;
  } else {
    return `${count} elements`;
  }
}

/**
 * Returns the grammatically correct singular or plural form of "layer"
 */
function getLayerText(count: number): string {
  return count === 1 ? 'layer' : 'layers';
}

/**
 * Gets the text style name for a text node
 */
async function getTextStyleName(node: TextNode): Promise<string | null> {
  try {
    if (node.textStyleId && typeof node.textStyleId === 'string' && node.textStyleId !== '') {
      const style = await figma.getStyleByIdAsync(node.textStyleId);
      return style ? style.name : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Converts RGB color to hex string
 */
function colorToHex(color: RGB): string {
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Gets fill information from a shape node
 */
function getFillInfo(node: SceneNode): string | null {
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
function getStrokeInfo(node: SceneNode): string | null {
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

/**
 * Determines a descriptive name for a shape node (e.g., "Rectangle", "Circle", "Vector").
 * Differentiates between Ellipse and Circle based on dimensions.
 */
function getShapeName(node: ShapeNode): string {
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
 * Extracts color (if solid fill) and dimensions from a shape node
 */
function getShapeInfo(node: ShapeNode): { colorHex: string; dimensions: string } {
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
 * Formats corner radius information for a node
 */
function formatCornerRadius(node: SceneNode): string | null {
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

/**
 * Attempts to find a header text from a direct child container if there's only one
 */
function findHeaderFromChild(parentNode: ContainerNode): string {
  const childContainers = parentNode.children.filter((child): child is ContainerNode =>
    isContainerType(child.type)
  );
  
  if (childContainers.length === 1) {
    const childHeaderText = findHeaderText(childContainers[0].children);
    if (childHeaderText) return childHeaderText;
  }
  
  return '';
}

// === NAME GENERATORS ===

/**
 * Generates a descriptive name for text nodes
 */
async function generateTextName(node: TextNode, settings: PluginSettings): Promise<string> {
  const nameParts: string[] = [];

  // Use text content as the primary name if enabled
  if (settings.useTextContent) {
    const content = getTextContent(node).trim();
    if (content) {
      // Limit text content length to keep names manageable
      const truncatedContent = content.length > 30 ? `${content.substring(0, 30)}...` : content;
      nameParts.push(`"${truncatedContent}"`);
    }
  }

  // Include text color
  if (settings.includeTextColor && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.visible !== false) {
      const colorHex = colorToHex(fill.color);
      nameParts.push(colorHex);
    }
  }

  // Include text style name
  if (settings.includeTextStyle) {
    const styleName = await getTextStyleName(node);
    if (styleName) {
      nameParts.push(`Style: ${styleName}`);
    }
  }

  // Include opacity if less than 100%
  if (settings.includeTextOpacity && node.opacity < 1) {
    nameParts.push(`Opacity: ${Math.round(node.opacity * 100)}%`);
  }

  // Join all parts with separator
  const finalName = nameParts
    .filter(part => part !== null && part !== '')
    .join(' - ');

  return finalName || 'Text';
}

/**
 * Generates a descriptive name for shape nodes
 */
async function generateShapeName(node: ShapeNode, settings: PluginSettings): Promise<string> {
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
    const fillInfo = getFillInfo(node);
    if (fillInfo) nameParts.push(fillInfo);
  }

  // Stroke settings
  if (settings.includeStrokeSettings) {
    const strokeInfo = getStrokeInfo(node);
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

/**
 * Generates a descriptive name for container nodes (Frames, Groups)
 */
async function generateContainerName(node: ContainerNode, settings: PluginSettings): Promise<string> {
  const nameParts: string[] = [];

  // Try to use header text from children first
  if (settings.useFirstTextContent) {
    const headerText = findHeaderText(node.children);
    if (headerText) {
      const truncatedText = headerText.length > 30 ? `${headerText.substring(0, 30)}...` : headerText;
      nameParts.push(`"${truncatedText}"`);
    } else {
      // Try to find text content from first text node
      const firstTextContent = findFirstTextContent(node.children);
      if (firstTextContent) {
        const truncatedText = firstTextContent.length > 30 ? `${firstTextContent.substring(0, 30)}...` : firstTextContent;
        nameParts.push(`"${truncatedText}"`);
      } else if (settings.useAutoLayoutNames) {
        // Try to find header from child container
        const childHeaderText = findHeaderFromChild(node);
        if (childHeaderText) {
          const truncatedText = childHeaderText.length > 30 ? `${childHeaderText.substring(0, 30)}...` : childHeaderText;
          nameParts.push(`"${truncatedText}"`);
        }
      }
    }
  }

  // Include container type
  if (settings.includeContainerType) {
    const containerType = node.type === 'FRAME' ? 'Frame' : 'Group';
    nameParts.push(containerType);
  }

  // Include container size
  if (settings.includeContainerSize && 'width' in node && 'height' in node) {
    const dimensions = `${Math.round(node.width)}x${Math.round(node.height)}`;
    nameParts.push(dimensions);
  }

  // Include children count
  if (settings.includeChildrenCount) {
    const childrenCount = node.children.length;
    const elementsText = getElementsCountText(childrenCount);
    nameParts.push(elementsText);
  }

  // Include opacity if less than 100%
  if (settings.includeContainerOpacity && node.opacity < 1) {
    nameParts.push(`Opacity: ${Math.round(node.opacity * 100)}%`);
  }

  // Join all parts with separator
  const finalName = nameParts
    .filter(part => part !== null && part !== '')
    .join(' - ');

  return finalName || (node.type === 'FRAME' ? 'Frame' : 'Group');
}

// === MAIN NAME GENERATION ===

/**
 * Main function to generate descriptive names for Figma nodes based on settings
 */
async function generateName(node: SceneNode, settings: PluginSettings): Promise<string> {
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

// === RENAMING LOGIC ===

/**
 * Recursively renames nodes based on settings
 */
async function renameNodeRecursively(node: SceneNode, settings: PluginSettings): Promise<void> {
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
async function renameSelectedLayers(providedSettings?: PluginSettings): Promise<void> {
  try {
    const selection = figma.currentPage.selection;
    
    if (selection.length === 0) {
      figma.notify('Please select at least one layer to rename.');
      return;
    }
    
    // Use provided settings or load from storage
    const settings = providedSettings || await figma.clientStorage.getAsync('settings') || DEFAULT_SETTINGS;
    
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

// === MAIN PLUGIN LOGIC ===

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

// === EXPORTS FOR TESTING ===
export {
  DEFAULT_SETTINGS,
  PluginSettings,
  isShapeType,
  isContainerType,
  isComponentType,
  colorToHex,
  getTextContent,
  getElementsCountText,
  getLayerText,
  formatCornerRadius,
  generateTextName,
  generateShapeName,
  generateContainerName,
  generateName,
  renameSelectedLayers,
  handleSettingsCommand
}; 