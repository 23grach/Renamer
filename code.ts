import { translations } from './translations';

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This plugin automatically renames layers based on their content and structure

let currentLanguage: 'ru' | 'en' = 'ru';

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

// Helper function to get correct plural form for elements
function getElementsCountText(count: number): string {
  if (currentLanguage === 'ru') {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastDigit === 1 && lastTwoDigits !== 11) {
      return translations.withElements.ru.replace('{count}', count.toString());
    } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
      return translations.withElements.ru.replace('{count}', count.toString());
    } else {
      return translations.withElements.ru.replace('{count}', count.toString());
    }
  } else {
    return translations.withElements.en.replace('{count}', count.toString());
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
    if (fill.type === 'SOLID' && fill.color) {
      const { r, g, b } = fill.color;
      colorHex = `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
    }
  }
  
  // Get dimensions
  if ('width' in node && 'height' in node) {
    dimensions = `${Math.round(node.width)}x${Math.round(node.height)}`;
  }
  
  return { colorHex, dimensions };
}

// Function to check if node is a component
function isComponent(node: SceneNode): boolean {
  return node.type === 'COMPONENT' || node.type === 'COMPONENT_SET' || 
         (node.type === 'INSTANCE' && node.mainComponent !== null);
}

// Function to get shape name based on characteristics
function getShapeName(node: SceneNode): string {
  const { colorHex, dimensions } = getShapeInfo(node);
  const parts = [];
  
  if (colorHex) {
    parts.push(colorHex);
  }
  
  if (dimensions) {
    parts.push(dimensions);
  }
  
  return parts.join(' ');
}

// Function to generate name for a node
function generateName(node: SceneNode): string {
  // Don't rename components
  if (isComponent(node)) {
    return node.name;
  }
  
  // Handle text nodes
  if (node.type === 'TEXT') {
    const text = node.characters;
    if (text.length > 20) {
      return `${translations.text[currentLanguage]} - ${text.substring(0, 20)}...`;
    }
    return text;
  }
  
  // Handle containers (frames and groups)
  if (node.type === 'FRAME' || node.type === 'GROUP') {
    const container = node as FrameNode | GroupNode;
    const children = container.children;
    
    // Count different types of elements
    const textCount = children.filter(child => child.type === 'TEXT').length;
    const buttonCount = children.filter(child => 
      child.type === 'FRAME' && child.name.toLowerCase().includes('button')
    ).length;
    const fieldCount = children.filter(child => 
      child.type === 'FRAME' && child.name.toLowerCase().includes('field')
    ).length;
    const cardCount = children.filter(child => 
      child.type === 'FRAME' && child.name.toLowerCase().includes('card')
    ).length;
    
    // Try to find header text
    const headerText = findHeaderText(children) || findHeaderFromChild(container);
    
    // Build container name
    let name = '';
    
    if (headerText) {
      name = headerText;
    } else if (buttonCount > 0) {
      name = `${translations.button[currentLanguage]} ${getElementsCountText(buttonCount)}`;
    } else if (fieldCount > 0) {
      name = `${translations.form[currentLanguage]} ${translations.withFields[currentLanguage].replace('{count}', fieldCount.toString())}`;
    } else if (cardCount > 0) {
      name = `${translations.card[currentLanguage]} ${translations.withCards[currentLanguage].replace('{count}', cardCount.toString())}`;
    } else {
      name = `${translations.container[currentLanguage]} ${getElementsCountText(children.length)}`;
    }
    
    return name;
  }
  
  // Handle shapes
  if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE' || node.type === 'POLYGON' || node.type === 'STAR') {
    return getShapeName(node);
  }
  
  // Default case
  return node.name;
}

// Function to rename node and its children recursively
function renameNodeRecursively(node: SceneNode): void {
  // Don't rename components
  if (isComponent(node)) {
    return;
  }
  
  // Rename current node
  node.name = generateName(node);
  
  // Rename children if node is a container
  if ('children' in node) {
    const container = node as FrameNode | GroupNode;
    container.children.forEach(child => renameNodeRecursively(child));
  }
}

// Main function to rename selected layers
function renameSelectedLayers(): void {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.notify('Пожалуйста, выберите слои для переименования');
    return;
  }
  
  selection.forEach(node => renameNodeRecursively(node));
  figma.notify('Слои успешно переименованы');
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'rename') {
    currentLanguage = msg.language;
    renameSelectedLayers();
  }
};

// Show UI
figma.showUI(__html__, { width: 300, height: 150 });
