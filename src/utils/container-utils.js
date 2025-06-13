"use strict";
/**
 * Container processing utilities for the Renamer plugin
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findHeaderFromChild = findHeaderFromChild;
const type_guards_1 = require("./type-guards");
const text_utils_1 = require("./text-utils");
/**
 * Attempts to find a header text from a direct child container if there's only one
 */
function findHeaderFromChild(parentNode) {
    const childContainers = parentNode.children.filter((child) => (0, type_guards_1.isContainerType)(child.type));
    if (childContainers.length === 1) {
        const childHeaderText = (0, text_utils_1.findHeaderText)(childContainers[0].children);
        if (childHeaderText)
            return childHeaderText;
    }
    return '';
}
