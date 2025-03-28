// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This plugin automatically renames layers based on their content and structure

// Helper function to get text content from a node
function getTextContent(node: SceneNode): string {
  if (node.type === 'TEXT') {
    return node.characters;
  }
  return '';
}

// Function to find header text within a container
function findHeaderText(nodes: readonly SceneNode[]): string {
  const textNodes = nodes.filter(node => node.type === 'TEXT') as TextNode[];
  
  if (textNodes.length === 0) return '';
  
  // Find the node with largest font size or boldest weight
  let headerNode = textNodes[0];
  
  for (const node of textNodes) {
    // Handle font size safely
    let currentFontSize = 0;
    let headerFontSize = 0;
    
    if (typeof node.fontSize === 'number') {
      currentFontSize = node.fontSize;
    }
    
    if (typeof headerNode.fontSize === 'number') {
      headerFontSize = headerNode.fontSize;
    }
    
    // Handle font weight safely
    let currentFontWeight = 400;
    let headerFontWeight = 400;
    
    if (typeof node.fontWeight === 'number') {
      currentFontWeight = node.fontWeight;
    }
    
    if (typeof headerNode.fontWeight === 'number') {
      headerFontWeight = headerNode.fontWeight;
    }
    
    // Prioritize bold over medium and larger size
    if (currentFontWeight > headerFontWeight || 
        (currentFontWeight === headerFontWeight && currentFontSize > headerFontSize)) {
      headerNode = node;
    }
  }
  
  return headerNode.characters;
}

// Helper function to get correct Russian plural form for "элемент"
function getElementsCountText(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return `${count} элемент`;
  } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
    return `${count} элемента`;
  } else {
    return `${count} элементов`;
  }
}

// Function to find header from a child container
function findHeaderFromChild(parentNode: FrameNode | GroupNode): string {
  const childContainers = parentNode.children.filter(child => 
    child.type === 'FRAME' || child.type === 'GROUP'
  );
  
  if (childContainers.length === 1) {
    const childContainer = childContainers[0];
    if ('children' in childContainer) {
      const childHeaderText = findHeaderText(childContainer.children);
      if (childHeaderText) {
        return childHeaderText;
      }
    }
  }
  
  return '';
}

// Function to get shape characteristics
function getShapeInfo(node: SceneNode): { colorHex: string; dimensions: string } {
  let colorHex = '';
  let dimensions = '';
  
  // Get fill color if available
  if ('fills' in node && node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID' && fill.visible !== false) {
      const color = fill.color;
      // Convert RGB (0-1) to hex
      const r = Math.round(color.r * 255).toString(16);
      const g = Math.round(color.g * 255).toString(16);
      const b = Math.round(color.b * 255).toString(16);
      // Ensure 2 digits for each color component
      const rHex = r.length === 1 ? '0' + r : r;
      const gHex = g.length === 1 ? '0' + g : g;
      const bHex = b.length === 1 ? '0' + b : b;
      colorHex = `#${rHex}${gHex}${bHex}`;
    }
  }
  
  // Add size information for all shapes that have width and height
  if ('width' in node && 'height' in node) {
    const width = Math.round(node.width);
    const height = Math.round(node.height);
    dimensions = `${width}x${height}`;
  }
  
  return { colorHex, dimensions };
}

// Function to check if a node is a component or instance
function isComponent(node: SceneNode): boolean {
  return node.type === 'COMPONENT' || 
         node.type === 'COMPONENT_SET' || 
         node.type === 'INSTANCE';
}

// Function to get specific shape name
function getShapeName(node: SceneNode): string {
  switch (node.type) {
    case 'RECTANGLE':
      return 'Прямоугольник';
    case 'ELLIPSE':
      // Check if it's a circle (same width and height)
      if ('width' in node && 'height' in node && node.width === node.height) {
        return 'Круг';
      }
      return 'Эллипс';
    case 'POLYGON':
      return 'Многоугольник';
    case 'STAR':
      return 'Звезда';
    case 'VECTOR':
      return 'Вектор';
    case 'LINE':
      return 'Линия';
    case 'BOOLEAN_OPERATION':
      return 'Фигура';
    default:
      return 'Элемент';
  }
}

// Function to generate name based on node type
function generateName(node: SceneNode): string {
  // Don't rename components or instances directly
  if (isComponent(node)) {
    return node.name;
  }
  
  // For text layers, use the text content
  if (node.type === 'TEXT') {
    const textContent = getTextContent(node);
    return textContent || 'Text';
  }
  
  // For Container concept - simple naming without colors or dimensions
  if (node.type === 'FRAME' || node.type === 'GROUP') {
    if ('children' in node && node.children.length > 0) {
      // Try to find header text directly in this container
      const headerText = findHeaderText(node.children);
      if (headerText) {
        return `Контейнер - ${headerText}`;
      }
      
      // If no header found, try to get it from a child container
      const childHeaderText = findHeaderFromChild(node);
      if (childHeaderText) {
        return `Контейнер - ${childHeaderText}`;
      }
      
      // If still no header found, show element count with proper word form
      return `Контейнер - ${getElementsCountText(node.children.length)}`;
    }
    return 'Контейнер - Пустой';
  }
  
  // For basic shapes - detailed naming with color and dimensions
  if (node.type === 'RECTANGLE' || 
      node.type === 'ELLIPSE' || 
      node.type === 'POLYGON' || 
      node.type === 'STAR' || 
      node.type === 'VECTOR' || 
      node.type === 'LINE' || 
      node.type === 'BOOLEAN_OPERATION') {
    
    // Get shape name
    const shapeName = getShapeName(node);
    
    // Get shape details (color, size, etc)
    const { colorHex, dimensions } = getShapeInfo(node);
    
    // Create the name with just shape information, without headers
    let name = shapeName;
    if (colorHex) name += ` - ${colorHex}`;
    if (dimensions) name += ` - ${dimensions}`;
    return name;
  }
  
  // Default case, keep original name
  return node.name;
}

// Recursive function to rename a node and all its children
function renameNodeRecursively(node: SceneNode): void {
  // Don't rename components or instances themselves, but process their children
  if (isComponent(node)) {
    // Process children recursively, but don't rename the component itself
    if ('children' in node) {
      for (const child of node.children) {
        renameNodeRecursively(child);
      }
    }
    return;
  }
  
  // Generate new name for the node
  const newName = generateName(node);
  node.name = newName;
  
  // Process children recursively
  if ('children' in node) {
    for (const child of node.children) {
      renameNodeRecursively(child);
    }
  }
}

// Main function to rename selected layers
function renameSelectedLayers(): void {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.notify('Please select at least one layer');
    return;
  }

  const notify = figma.notify('Renaming layers...', { timeout: 60000 });
  
  for (const node of selection) {
    renameNodeRecursively(node);
  }

  notify.cancel();
  figma.notify(`Layers renamed successfully`);
}

// Execute the renaming
(() => {
  renameSelectedLayers();
  figma.closePlugin();
})();
