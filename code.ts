// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This plugin automatically renames layers based on their content and structure

// Constants
const SHAPE_TYPES = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE', 'BOOLEAN_OPERATION'] as const;
const COMPONENT_TYPES = ['COMPONENT', 'COMPONENT_SET', 'INSTANCE'] as const;
const CONTAINER_TYPES = ['FRAME', 'GROUP'] as const;

// --- Type Guards ---

/**
 * Checks if a node type string is a valid ShapeType.
 * @param type The node type string.
 * @returns True if the type is a ShapeType, false otherwise.
 */
function isShapeType(type: string): type is ShapeType {
    return (SHAPE_TYPES as readonly string[]).includes(type);
}

/**
 * Checks if a node type string is a valid ComponentType.
 * @param type The node type string.
 * @returns True if the type is a ComponentType, false otherwise.
 */
function isComponentType(type: string): type is ComponentType {
    return (COMPONENT_TYPES as readonly string[]).includes(type);
}

/**
 * Checks if a node type string is a valid ContainerType.
 * @param type The node type string.
 * @returns True if the type is a ContainerType, false otherwise.
 */
function isContainerType(type: string): type is ContainerType {
    return (CONTAINER_TYPES as readonly string[]).includes(type);
}

// --- Settings ---
// Default settings
const DEFAULT_SETTINGS = {
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

// Type for settings
type PluginSettings = typeof DEFAULT_SETTINGS;

// --- Types ---
type ShapeType = typeof SHAPE_TYPES[number];
type ComponentType = typeof COMPONENT_TYPES[number];
type ContainerType = typeof CONTAINER_TYPES[number];

type ShapeNode = RectangleNode | EllipseNode | PolygonNode | StarNode | VectorNode | LineNode | BooleanOperationNode;
type ContainerNode = FrameNode | GroupNode;

/**
 * Gets the text content from a TextNode.
 * @param node The SceneNode to extract text from.
 * @returns The character content if it's a TextNode, otherwise an empty string.
 */
function getTextContent(node: SceneNode): string {
  return node.type === 'TEXT' ? node.characters : '';
}

/**
 * Finds the most prominent text node within a list of nodes, considered as a header.
 * Prominence is determined by font weight first, then font size.
 * @param nodes An array of SceneNodes to search within.
 * @returns The character content of the header text node, or an empty string if no text nodes are found.
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
 * Returns the grammatically correct plural form for "element" based on the count.
 * Handles Russian pluralization rules for 1, 2-4, and 5+ elements.
 * @param count The number of elements.
 * @returns A string like "1 element" or "5 elements".
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
 * Returns the grammatically correct singular or plural form of "layer".
 * @param count The number of layers.
 * @returns "layer" if count is 1, otherwise "layers".
 */
function getLayerText(count: number): string {
  return count === 1 ? 'layer' : 'layers';
}

/**
 * Attempts to find a header text from a direct child container if there's only one.
 * @param parentNode The parent container node.
 * @returns The header text found in the single child container, or an empty string.
 */
function findHeaderFromChild(parentNode: ContainerNode): string {
  // Using type guard for child.type
  const childContainers = parentNode.children.filter((child): child is ContainerNode =>
    isContainerType(child.type)
  );
  
  if (childContainers.length === 1) {
    const childHeaderText = findHeaderText(childContainers[0].children);
    if (childHeaderText) return childHeaderText;
  }
  
  return '';
}

/**
 * Extracts color (if solid fill) and dimensions from a shape node.
 * @param node The shape node (Rectangle, Ellipse, etc.).
 * @returns An object containing the hex color string (e.g., "#RRGGBB") and dimensions string (e.g., "100x50"). 
 *          Returns empty strings if color or dimensions cannot be determined.
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
 * Checks if a node is a Component, Component Set, or Instance.
 * @param node The SceneNode to check.
 * @returns True if the node is a component type, false otherwise.
 */
function isComponent(node: SceneNode): boolean {
  // Using type guard
  return isComponentType(node.type);
}

/**
 * Determines a descriptive name for a shape node (e.g., "Rectangle", "Circle", "Vector").
 * Differentiates between Ellipse and Circle based on dimensions.
 * @param node The shape node.
 * @returns A string representing the shape's name.
 */
function getShapeName(node: ShapeNode): string {
  // Type guard is not strictly needed here as the input `node` is already ShapeNode,
  // but adding it for consistency and safety if the function signature were less specific.
  // However, ShapeType is required for the record key.
  if (!isShapeType(node.type)) {
      console.warn(`Node type "${node.type}" is not a valid ShapeType in getShapeName.`);
      return 'Element'; // Fallback name
  }
  
  const shapeNames: Partial<Record<ShapeType, string>> = { // Use Partial<> as we handle the check
    'RECTANGLE': 'Rectangle',
    'ELLIPSE': ('width' in node && 'height' in node && node.width === node.height) ? 'Circle' : 'Ellipse',
    'POLYGON': 'Polygon',
    'STAR': 'Star',
    'VECTOR': 'Vector',
    'LINE': 'Line',
    'BOOLEAN_OPERATION': 'Shape'
  };
  
  return shapeNames[node.type] || 'Element'; // Access using the now validated type
}

/**
 * Formats corner radius value for display.
 */
function formatCornerRadius(node: SceneNode): string | null {
  if ('cornerRadius' in node) {
    if (typeof node.cornerRadius === 'number') {
      // Only show if radius is greater than 0
      return node.cornerRadius > 0 ? `r${node.cornerRadius}` : null;
    } else if ( // Check if it has individual corner properties (mixed radius)
      'topLeftRadius' in node && typeof node.topLeftRadius === 'number' &&
      'topRightRadius' in node && typeof node.topRightRadius === 'number' &&
      'bottomLeftRadius' in node && typeof node.bottomLeftRadius === 'number' &&
      'bottomRightRadius' in node && typeof node.bottomRightRadius === 'number'
    ) {
       // Only add if at least one corner is rounded
       if (node.topLeftRadius > 0 || node.topRightRadius > 0 || node.bottomLeftRadius > 0 || node.bottomRightRadius > 0) {
         // Format for mixed radius
         return `r${node.topLeftRadius},${node.topRightRadius},${node.bottomRightRadius},${node.bottomLeftRadius}`;
       }
    }
  }
  return null;
}

/**
 * Converts Paint color (e.g., from fills or strokes) to a hex string.
 * Ignores opacity for simplicity in the name.
 */
function colorToHex(color: RGB): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  // Ensure hex value has 6 digits with padding if necessary
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase().padStart(6, '0')}`;
  return hex;
}

/**
 * Gets stroke information (weight and color) if applicable.
 */
function getStrokeInfo(node: SceneNode, settings: PluginSettings): string | null {
  // Ensure node has strokes and strokeWeight properties
  if (!('strokes' in node && 'strokeWeight' in node)) return null;
  if (!(Array.isArray(node.strokes) && node.strokes.length > 0 && typeof node.strokeWeight === 'number' && node.strokeWeight > 0)) {
     return null; // No visible strokes or weight
  }

  const visibleStroke = node.strokes.find(s => s.visible !== false && s.type === 'SOLID'); // Consider only first visible solid stroke
  if (!visibleStroke || visibleStroke.type !== 'SOLID') return null; // Only handle solid strokes for now

  // Fallback to weight and color if enabled
   if (settings.includeStrokeSettings) {
     const weight = node.strokeWeight; // Already confirmed it's a number > 0
     const colorHex = colorToHex(visibleStroke.color);
     // Format as "stroke: Weightpx #HEXCOLOR"
     return `stroke: ${weight}px ${colorHex}`;
   }

  return null; // Return null if neither style nor info is enabled/applicable
}

/**
 * Gets fill style name or color hex if applicable.
 * Prioritizes style name if enabled.
 */
function getFillInfo(node: SceneNode, settings: PluginSettings): string | null {
   // Ensure node has fills property
   if (!('fills' in node) || !Array.isArray(node.fills)) return null;

   const visibleFills = node.fills.filter(f => f.visible !== false);
   if (visibleFills.length === 0) return null; // No visible fills

   // Fallback to fill color if enabled (and no style or style check disabled)
   // Use the first visible solid fill for color info
   if (settings.includeFillColor) {
       const solidFill = visibleFills.find(f => f.type === 'SOLID');
       if (solidFill && solidFill.type === 'SOLID') { // Check type again for type safety
           const colorHex = colorToHex(solidFill.color);
           return colorHex; // Return just the hex color as before
       }
   }
   return null;
}

/**
 * Finds the first text node within a container's children.
 * @param nodes An array of SceneNodes to search within.
 * @returns The character content of the first text node, or an empty string if no text nodes are found.
 */
function findFirstTextContent(nodes: readonly SceneNode[]): string {
  const firstTextNode = nodes.find((node): node is TextNode => node.type === 'TEXT');
  return firstTextNode ? firstTextNode.characters : '';
}

/**
 * Gets the text style name if available
 * @param node The text node to get style from
 * @returns The style name or null if no style is applied
 */
function getTextStyleName(node: TextNode): string | null {
  if (node.textStyleId && typeof node.textStyleId === 'string') {
    const style = figma.getStyleById(node.textStyleId);
    return style ? style.name : null;
  }
  return null;
}

/**
 * Generates a descriptive name for a SceneNode based on its type, content, and settings.
 * @param node The SceneNode to generate a name for.
 * @param settings The plugin settings object.
 * @returns The generated name string.
 */
function generateName(node: SceneNode, settings: PluginSettings): string {
  try {
    const nameParts: (string | null)[] = [];

    // Text Layers
    if (node.type === 'TEXT' && settings.enableTextLayers) {
      // Base name from content
      if (settings.useTextContent) {
        nameParts.push(node.characters || 'Text');
      }

      // Text color
      if (settings.includeTextColor && Array.isArray(node.fills) && node.fills.length > 0) {
        const firstFill = node.fills[0];
        if (firstFill.type === 'SOLID') {
          nameParts.push(colorToHex(firstFill.color));
        }
      }

      // Text style
      if (settings.includeTextStyle) {
        const styleName = getTextStyleName(node);
        if (styleName) nameParts.push(styleName);
      }

      // Opacity
      if (settings.includeTextOpacity && node.opacity < 1) {
        nameParts.push(`Opacity: ${Math.round(node.opacity * 100)}%`);
      }
    }
    
    // Containers (Frame, Group, Component, etc.)
    else if (isContainerType(node.type) && settings.enableContainers) {
      const containerNode = node as ContainerNode;
      
      // Container type
      if (settings.includeContainerType) {
        if (settings.useAutoLayoutNames && 'layoutMode' in containerNode && containerNode.layoutMode !== 'NONE') {
          nameParts.push(containerNode.layoutMode === 'VERTICAL' ? 'V-Container' : 'H-Container');
        } else {
          nameParts.push(node.type === 'FRAME' ? 'Frame' : 'Group');
        }
      }

      // Container size
      if (settings.includeContainerSize) {
        nameParts.push(`${Math.round(containerNode.width)}x${Math.round(containerNode.height)}`);
      }

      // First text content or children count
      if (containerNode.children.length > 0) {
        if (settings.useFirstTextContent) {
          const firstTextContent = findFirstTextContent(containerNode.children);
          if (firstTextContent) {
            nameParts.push(firstTextContent);
          } else if (settings.includeChildrenCount) {
            nameParts.push(getElementsCountText(containerNode.children.length));
          }
        } else if (settings.includeChildrenCount) {
          nameParts.push(getElementsCountText(containerNode.children.length));
        }
      }

      // Opacity
      if (settings.includeContainerOpacity && containerNode.opacity < 1) {
        nameParts.push(`Opacity: ${Math.round(containerNode.opacity * 100)}%`);
      }
    }
    
    // Figures (Shapes)
    else if (isShapeType(node.type) && settings.enableFigures) {
      const shapeNode = node as ShapeNode;

      // Shape type
      if (settings.includeShapeType) {
        nameParts.push(getShapeName(shapeNode));
      }

      // Size
      if (settings.includeShapeSize) {
        const { dimensions } = getShapeInfo(shapeNode);
        if (dimensions) nameParts.push(dimensions);
      }

      // Fill color
      if (settings.includeFillColor) {
        const fillInfo = getFillInfo(shapeNode, settings);
        if (fillInfo) nameParts.push(fillInfo);
      }

      // Stroke settings
      if (settings.includeStrokeSettings) {
        const strokeInfo = getStrokeInfo(shapeNode, settings);
        if (strokeInfo) nameParts.push(strokeInfo);
      }

      // Corner radius
      if (settings.includeCornerRadius) {
        const radiusInfo = formatCornerRadius(shapeNode);
        if (radiusInfo) nameParts.push(radiusInfo);
      }

      // Opacity
      if (settings.includeFigureOpacity && shapeNode.opacity < 1) {
        nameParts.push(`Opacity: ${Math.round(shapeNode.opacity * 100)}%`);
      }
    }

    // Join all parts with separator
    const finalName = nameParts
      .filter(part => part !== null && part !== '')
      .join(' - ');

    return finalName || node.name; // Fallback to original name if no parts
  } catch (e) {
    console.error(`Error generating name for node ${node.id} (${node.name}):`, e);
    return node.name; // Return original name on error
  }
}

/**
 * Recursively renames a node and its children based on generated names.
 * Skips renaming components themselves but traverses into their children if they are containers.
 * @param node The starting SceneNode.
 * @param settings The plugin settings to use for name generation.
 */
function renameNodeRecursively(node: SceneNode, settings: PluginSettings): void {
  try {
    let shouldRecurse = false; // Flag to control recursion

    // Skip renaming components themselves
    if (isComponent(node)) {
        // Only recurse into components if they can have children (are containers)
        shouldRecurse = 'children' in node && isContainerType(node.type);
    } else {
        // Generate and assign name for non-components
        const newName = generateName(node, settings);
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
          (node.children as SceneNode[]).forEach(child => renameNodeRecursively(child, settings));
      }
    }
  } catch (e) {
    console.error(`Error processing node ${node.id} (${node.name}) or its children:`, e);
    // Optional: Notify the user once about errors? Or log them for debugging.
    // figma.notify(`Error processing layer: ${node.name}`, { error: true, timeout: 2000 });
  }
}

/**
 * Main function to rename all currently selected layers.
 * Loads settings and applies renaming recursively to each selected node.
 * Provides more accurate feedback on renamed layers.
 */
async function renameSelectedLayers(): Promise<void> {
  try {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('Please select at least one layer to rename.');
      // Keep plugin open if settings might be displayed
      return;
    }

    // Load settings or use defaults
    // Ensure DEFAULT_SETTINGS includes the new boolean flags
    const settings = await figma.clientStorage.getAsync('settings') || DEFAULT_SETTINGS;

    let renamedCount = 0;
    const originalNames = new Map<string, string>(); // Store original names to check for changes

    // First pass: store original names
    selection.forEach(node => {
        originalNames.set(node.id, node.name);
    });

    // Second pass: rename recursively
    selection.forEach(node => {
        renameNodeRecursively(node, settings);
    });

    // Third pass: count actual changes on top-level selected items (excluding components)
    selection.forEach(node => {
        const originalName = originalNames.get(node.id);
        // Count if it's not a component and the name is different from the original
        if (!isComponent(node) && node.name !== originalName) {
             renamedCount++;
        }
    });

     // Notify based on the count
     if (renamedCount > 0) {
        const layerText = getLayerText(renamedCount); // Assumes getLayerText handles pluralization
        figma.notify(`Renamed ${renamedCount} ${layerText}.`);
     } else {
        // Notify if selection exists but nothing was renamed
        // This could be because only components were selected, or names didn't change based on settings
        figma.notify('No selected layers required renaming with the current settings.');
     }
     figma.closePlugin(); // Explicitly close after run command finishes

  } catch (e) {
    console.error("Error during layer renaming process:", e);
    figma.notify(
      'An error occurred during renaming. Check developer console (Plugins > Dev > Open Console).',
      { error: true, timeout: 6000 } // Longer timeout for error message
    );
    // Close plugin on error
    // figma.closePlugin();
    figma.closePlugin(); // Also ensure closing on error
  }
}

/**
 * Handles the 'settings' command.
 * Loads existing settings or defaults, shows the UI, and sends settings to it.
 */
async function handleSettingsCommand(): Promise<void> {
  // Load saved settings
  const savedSettings = await figma.clientStorage.getAsync('settings') || DEFAULT_SETTINGS;
  
  figma.showUI(__html__, { width: 300, height: 640 });
  
  // Send saved settings to UI
  figma.ui.postMessage({ 
    type: 'load-settings',
    settings: savedSettings
  });
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'save-settings') {
    // Save settings to client storage
    await figma.clientStorage.setAsync('settings', msg.settings);
  }
};

// Handle menu commands
figma.on('run', async ({ command }) => {
  if (command === 'settings') {
    await handleSettingsCommand();
  } else {
    // Use await since renameSelectedLayers is now async
    await renameSelectedLayers();
  }
});
