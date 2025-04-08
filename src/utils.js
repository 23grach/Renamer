// --- Type Guards ---
/**
 * Type guard to check if a string is a valid ShapeType.
 * @param type The string to check.
 * @returns True if the type is a valid ShapeType, false otherwise.
 */
export function isShapeType(type) {
    return ['RECTANGLE', 'ELLIPSE', 'POLYGON', 'STAR', 'LINE', 'VECTOR'].includes(type);
}
// --- Helper Functions ---
/**
 * Checks if a node is visible based on the 'visible' property.
 * Handles cases where the property might be missing (defaults to true).
 * @param node The Figma node to check.
 * @returns True if the node is visible, false otherwise.
 */
export function isNodeVisible(node) {
    return node.visible !== false; // Assume visible if property is undefined
}
/**
 * Checks if a node type is valid for renaming according to common use cases.
 * Excludes types like 'SLICE', 'GROUP' (unless processing children).
 * @param nodeType The type of the Figma node.
 * @returns True if the node type is generally considered valid for direct renaming.
 */
export function isValidNodeType(nodeType) {
    // Add or remove types as needed for your plugin's logic
    return !['SLICE'].includes(nodeType);
}
/**
 * Safely retrieves text content from a TextNode.
 * @param node The Figma node, potentially a TextNode.
 * @param maxLength The maximum length for the returned text content.
 * @returns The text content or undefined if not a TextNode or no characters.
 */
export function getTextContent(node, maxLength) {
    if (node.type === 'TEXT' && node.characters) {
        return node.characters.substring(0, maxLength).trim();
    }
    return undefined;
}
/**
 * Tries to find a relevant header text node near the target node.
 * Searches siblings above the target node for a TEXT node.
 * Note: This is a simple heuristic and might need refinement based on document structure.
 * @param targetNode The node for which to find a header.
 * @returns The content of the nearest preceding text node sibling, or undefined.
 */
export function findHeaderText(targetNode) {
    const parent = targetNode.parent;
    if (!parent || !('children' in parent)) {
        return undefined;
    }
    const siblings = parent.children;
    const targetIndex = siblings.findIndex(child => child.id === targetNode.id);
    if (targetIndex === -1) {
        return undefined; // Should not happen if targetNode is valid
    }
    // Search backwards from the node before the target
    for (let i = targetIndex - 1; i >= 0; i--) {
        const sibling = siblings[i];
        if (sibling.type === 'TEXT' && sibling.characters) {
            // Found a text node, consider it the header
            // Basic check: ensure it's somewhat visually above or aligned left
            // This simple check might not cover all layout cases
            if (sibling.y <= targetNode.y || sibling.x <= targetNode.x) {
                return sibling.characters.trim();
            }
        }
        // Optional: Stop searching if a non-text node is encountered?
        // else { break; }
    }
    return undefined; // No preceding text sibling found
}
/**
 * Extracts basic information (type, dimensions, color) from a shape node.
 * @param node The Figma node, expected to be a shape.
 * @returns An object containing shape info, or undefined if not applicable.
 */
export function getShapeInfo(node) {
    // Use the type guard here
    if (isShapeType(node.type) && 'width' in node && 'height' in node) {
        const info = {
            width: Math.round(node.width),
            height: Math.round(node.height),
        };
        // Try to get the primary fill color
        if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
            const firstFill = node.fills[0];
            // Check if it's a solid color fill
            if (firstFill.type === 'SOLID' && firstFill.color) {
                const { r, g, b } = firstFill.color;
                // Convert Figma's 0-1 RGB to 0-255 and then to HEX
                const toHex = (value) => {
                    const hex = Math.round(value * 255).toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                };
                info.colorHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
            }
        }
        return info;
    }
    return undefined;
}
/**
 * Generates a new name for a node based on extracted info and settings.
 * @param nodeInfo The extracted information about the node.
 * @param settings The renaming settings from the UI.
 * @param index Optional index for auto-numbering.
 * @returns The generated name string.
 */
export function generateName(nodeInfo, settings, index) {
    let parts = [];
    // 1. Auto-numbering (if enabled)
    if (settings.useAutoNumbering && index !== undefined) {
        // Simple 1-based numbering, customize formatting as needed
        parts.push(String(index + 1).padStart(2, '0')); // e.g., 01, 02, ...
    }
    // 2. Node Type (if enabled)
    if (settings.includeNodeType) {
        // Use a more readable format for type
        const typeName = nodeInfo.type.charAt(0).toUpperCase() + nodeInfo.type.slice(1).toLowerCase();
        parts.push(typeName);
    }
    // 3. Text Content (if enabled and available)
    if (settings.includeTextContent && nodeInfo.textContent) {
        parts.push(nodeInfo.textContent);
    }
    // 4. Shape Info (if enabled and available)
    if (settings.includeShapeInfo && nodeInfo.shapeInfo) {
        const shapeParts = [];
        shapeParts.push(`${nodeInfo.shapeInfo.width}x${nodeInfo.shapeInfo.height}`);
        if (nodeInfo.shapeInfo.colorHex) {
            shapeParts.push(nodeInfo.shapeInfo.colorHex);
        }
        parts.push(`[${shapeParts.join(' ')}]`);
    }
    // Fallback to original name if no parts were generated
    if (parts.length === 0) {
        parts.push(nodeInfo.name); // Use original name as base
    }
    let newName = parts.join('_'); // Join parts with an underscore
    // Add Prefix (if enabled)
    if (settings.usePrefix && settings.prefixText) {
        newName = `${settings.prefixText}${newName}`;
    }
    // Add Suffix (if enabled)
    if (settings.useSuffix && settings.suffixText) {
        newName = `${newName}${settings.suffixText}`;
    }
    // Clean up potential multiple underscores or leading/trailing underscores
    newName = newName.replace(/_+/g, '_').replace(/^_|_$/g, '');
    return newName || "RenamedLayer"; // Ensure name is not empty
}
