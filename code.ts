// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This plugin automatically renames layers based on their content and structure

// Constants
const SHAPE_TYPES = ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'VECTOR', 'LINE', 'BOOLEAN_OPERATION'] as const;
const COMPONENT_TYPES = ['COMPONENT', 'COMPONENT_SET', 'INSTANCE'] as const;
const CONTAINER_TYPES = ['FRAME', 'GROUP'] as const;

type ShapeType = typeof SHAPE_TYPES[number];
type ComponentType = typeof COMPONENT_TYPES[number];
type ContainerType = typeof CONTAINER_TYPES[number];

type ShapeNode = RectangleNode | EllipseNode | PolygonNode | StarNode | VectorNode | LineNode | BooleanOperationNode;
type ContainerNode = FrameNode | GroupNode;

// Helper function to get text content from a node
function getTextContent(node: SceneNode): string {
  return node.type === 'TEXT' ? node.characters : '';
}

// Function to find header text within a container
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

// Helper function to get correct plural form for "element"
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

// Function to find header from a child container
function findHeaderFromChild(parentNode: ContainerNode): string {
  const childContainers = parentNode.children.filter((child): child is ContainerNode => 
    CONTAINER_TYPES.includes(child.type as ContainerType)
  );
  
  if (childContainers.length === 1) {
    const childHeaderText = findHeaderText(childContainers[0].children);
    if (childHeaderText) return childHeaderText;
  }
  
  return '';
}

// Function to get shape characteristics
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

// Function to check if a node is a component or instance
function isComponent(node: SceneNode): boolean {
  return COMPONENT_TYPES.includes(node.type as ComponentType);
}

// Function to get specific shape name
function getShapeName(node: ShapeNode): string {
  const shapeNames: Record<ShapeType, string> = {
    'RECTANGLE': 'Rectangle',
    'ELLIPSE': ('width' in node && 'height' in node && node.width === node.height) ? 'Circle' : 'Ellipse',
    'POLYGON': 'Polygon',
    'STAR': 'Star',
    'VECTOR': 'Vector',
    'LINE': 'Line',
    'BOOLEAN_OPERATION': 'Shape'
  };
  
  return shapeNames[node.type as ShapeType] || 'Element';
}

// Function to generate name based on node type
function generateName(node: SceneNode): string {
  if (isComponent(node)) return node.name;
  if (node.type === 'TEXT') return getTextContent(node) || 'Text';
  
  if (CONTAINER_TYPES.includes(node.type as ContainerType)) {
    const containerNode = node as ContainerNode;
    if (containerNode.children.length > 0) {
      const headerText = findHeaderText(containerNode.children) || findHeaderFromChild(containerNode);
      return headerText 
        ? `Container - ${headerText}`
        : `Container - ${getElementsCountText(containerNode.children.length)}`;
    }
    return 'Container - Empty';
  }
  
  if (SHAPE_TYPES.includes(node.type as ShapeType)) {
    const shapeNode = node as ShapeNode;
    const shapeName = getShapeName(shapeNode);
    const { colorHex, dimensions } = getShapeInfo(shapeNode);
    
    return [shapeName, colorHex, dimensions]
      .filter(Boolean)
      .join(' - ');
  }
  
  return node.name;
}

// Recursive function to rename a node and all its children
function renameNodeRecursively(node: SceneNode): void {
  if (isComponent(node)) {
    if ('children' in node) {
      node.children.forEach(renameNodeRecursively);
    }
    return;
  }
  
  node.name = generateName(node);
  
  if ('children' in node) {
    node.children.forEach(renameNodeRecursively);
  }
}

// Main function to rename selected layers
function renameSelectedLayers(): void {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.notify('Please select at least one layer');
    figma.closePlugin();
    return;
  }
  
  selection.forEach(renameNodeRecursively);
  figma.notify('Layers successfully renamed');
  figma.closePlugin();
}

// Register the plugin
renameSelectedLayers();
