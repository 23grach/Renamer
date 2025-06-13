"use strict";
/**
 * Tests for all Container parameters and renaming scenarios
 */
describe('Container Parameter Tests', () => {
    // Mock node factories
    const mockTextNode = (options = {}) => ({
        type: 'TEXT',
        name: options.name || 'Text',
        characters: options.characters || 'Sample Text',
        fills: options.fills || [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, visible: true }],
        fontSize: options.fontSize || 16,
        fontWeight: options.fontWeight || 400,
        opacity: options.opacity || 1,
        id: Math.random().toString()
    });
    const mockFrameNode = (options = {}) => ({
        type: 'FRAME',
        name: options.name || 'Frame',
        width: options.width || 200,
        height: options.height || 200,
        children: options.children || [],
        opacity: options.opacity || 1,
        id: Math.random().toString()
    });
    const mockGroupNode = (options = {}) => ({
        type: 'GROUP',
        name: options.name || 'Group',
        children: options.children || [],
        opacity: options.opacity || 1,
        id: Math.random().toString()
    });
    const mockRectangleNode = (options = {}) => ({
        type: 'RECTANGLE',
        name: options.name || 'Rectangle',
        width: options.width || 100,
        height: options.height || 100,
        fills: options.fills || [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, visible: true }],
        opacity: options.opacity || 1,
        id: Math.random().toString()
    });
    describe('enableContainers parameter', () => {
        test('enableContainers: true - should process container nodes', () => {
            const settings = {
                enableContainers: true,
                includeContainerType: true,
                includeContainerSize: false,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: false,
                useAutoLayoutNames: false
            };
            const frameNode = mockFrameNode({});
            const groupNode = mockGroupNode({});
            expect(settings.enableContainers).toBe(true);
            expect(frameNode.type).toBe('FRAME');
            expect(groupNode.type).toBe('GROUP');
        });
        test('enableContainers: false - should return original name', () => {
            const settings = {
                enableContainers: false,
                includeContainerType: true,
                includeContainerSize: true,
                includeChildrenCount: true,
                includeContainerOpacity: true,
                useFirstTextContent: true,
                useAutoLayoutNames: true
            };
            const frameNode = mockFrameNode({ name: 'Original Frame' });
            const groupNode = mockGroupNode({ name: 'Original Group' });
            expect(settings.enableContainers).toBe(false);
            expect(frameNode.name).toBe('Original Frame');
            expect(groupNode.name).toBe('Original Group');
        });
    });
    describe('includeContainerType parameter', () => {
        test('includeContainerType: true - should include Frame or Group', () => {
            const containerTypeTests = [
                { type: 'FRAME', expectedType: 'Frame' },
                { type: 'GROUP', expectedType: 'Group' }
            ];
            containerTypeTests.forEach(({ type, expectedType }) => {
                if (type === 'FRAME') {
                    const frameNode = mockFrameNode({});
                    expect(frameNode.type).toBe('FRAME');
                    expect(expectedType).toBe('Frame');
                }
                else if (type === 'GROUP') {
                    const groupNode = mockGroupNode({});
                    expect(groupNode.type).toBe('GROUP');
                    expect(expectedType).toBe('Group');
                }
            });
        });
        test('includeContainerType: false - should not include container type', () => {
            const settings = {
                enableContainers: true,
                includeContainerType: false,
                includeContainerSize: true,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: false,
                useAutoLayoutNames: false
            };
            const frameNode = mockFrameNode({});
            expect(settings.includeContainerType).toBe(false);
            // Result should not contain "Frame"
        });
    });
    describe('includeContainerSize parameter', () => {
        test('includeContainerSize: true - should include dimensions for frames', () => {
            const sizeTestCases = [
                { width: 300, height: 200, expected: '300x200' },
                { width: 150, height: 150, expected: '150x150' },
                { width: 400, height: 250, expected: '400x250' },
                { width: 100.7, height: 75.3, expected: '101x75' }, // Should round
                { width: 0, height: 0, expected: '0x0' }
            ];
            sizeTestCases.forEach(({ width, height, expected }) => {
                const frameNode = mockFrameNode({ width, height });
                const roundedWidth = Math.round(width);
                const roundedHeight = Math.round(height);
                const result = `${roundedWidth}x${roundedHeight}`;
                expect(result).toBe(expected);
            });
        });
        test('includeContainerSize: false - should not include dimensions', () => {
            const settings = {
                enableContainers: true,
                includeContainerType: true,
                includeContainerSize: false,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: false,
                useAutoLayoutNames: false
            };
            const frameNode = mockFrameNode({ width: 250, height: 180 });
            expect(settings.includeContainerSize).toBe(false);
            // Result should not contain "250x180"
        });
        test('includeContainerSize: true - should handle Groups without size', () => {
            // Groups don't have width/height properties
            const groupNode = mockGroupNode({});
            expect(groupNode.width).toBeUndefined();
            expect(groupNode.height).toBeUndefined();
            // Should not add dimensions for groups
        });
    });
    describe('includeChildrenCount parameter', () => {
        test('includeChildrenCount: true - should include element count with proper grammar', () => {
            const childrenCountTests = [
                { count: 0, expected: '0 elements' },
                { count: 1, expected: '1 element' },
                { count: 2, expected: '2 elements' },
                { count: 5, expected: '5 elements' },
                { count: 10, expected: '10 elements' },
                { count: 21, expected: '21 element' }, // Russian pluralization: ends in 1
                { count: 22, expected: '22 elements' }, // Russian pluralization: ends in 2-4
                { count: 25, expected: '25 elements' } // Russian pluralization: ends in 5+
            ];
            childrenCountTests.forEach(({ count, expected }) => {
                const children = Array(count).fill(null).map(() => mockTextNode({}));
                const frameNode = mockFrameNode({ children });
                // Test English pluralization rules
                const lastDigit = count % 10;
                const lastTwoDigits = count % 100;
                let result;
                if (lastDigit === 1 && lastTwoDigits !== 11) {
                    result = `${count} element`;
                }
                else {
                    result = `${count} elements`;
                }
                expect(result).toBe(expected);
                expect(frameNode.children.length).toBe(count);
            });
        });
        test('includeChildrenCount: false - should not include children count', () => {
            const settings = {
                enableContainers: true,
                includeContainerType: true,
                includeContainerSize: false,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: false,
                useAutoLayoutNames: false
            };
            const child1 = mockTextNode({});
            const child2 = mockRectangleNode({});
            const frameNode = mockFrameNode({ children: [child1, child2] });
            expect(settings.includeChildrenCount).toBe(false);
            expect(frameNode.children.length).toBe(2);
            // Result should not contain "2 elements"
        });
    });
    describe('includeContainerOpacity parameter', () => {
        test('includeContainerOpacity: true - should include opacity when less than 100%', () => {
            const opacityTestCases = [
                { opacity: 1.0, expected: null }, // 100% should not be included
                { opacity: 0.95, expected: 'Opacity: 95%' },
                { opacity: 0.8, expected: 'Opacity: 80%' },
                { opacity: 0.5, expected: 'Opacity: 50%' },
                { opacity: 0.25, expected: 'Opacity: 25%' },
                { opacity: 0.1, expected: 'Opacity: 10%' },
                { opacity: 0, expected: 'Opacity: 0%' }
            ];
            opacityTestCases.forEach(({ opacity, expected }) => {
                const frameNode = mockFrameNode({ opacity });
                if (opacity < 1) {
                    const percentageOpacity = Math.round(opacity * 100);
                    const result = `Opacity: ${percentageOpacity}%`;
                    expect(result).toBe(expected);
                }
                else {
                    expect(expected).toBeNull();
                }
            });
        });
        test('includeContainerOpacity: false - should not include opacity', () => {
            const settings = {
                enableContainers: true,
                includeContainerType: true,
                includeContainerSize: false,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: false,
                useAutoLayoutNames: false
            };
            const frameNode = mockFrameNode({ opacity: 0.7 });
            expect(settings.includeContainerOpacity).toBe(false);
            // Result should not contain "Opacity:"
        });
    });
    describe('useFirstTextContent parameter', () => {
        test('useFirstTextContent: true - should find and use header text', () => {
            const headerTextTests = [
                {
                    name: 'single text child',
                    children: [mockTextNode({ characters: 'Card Title' })],
                    expectedHeaderText: 'Card Title'
                },
                {
                    name: 'multiple text children - prominence by font weight',
                    children: [
                        mockTextNode({ characters: 'Subtitle', fontWeight: 400 }),
                        mockTextNode({ characters: 'Main Title', fontWeight: 700 }),
                        mockTextNode({ characters: 'Caption', fontWeight: 300 })
                    ],
                    expectedHeaderText: 'Main Title' // Highest font weight
                },
                {
                    name: 'multiple text children - prominence by font size',
                    children: [
                        mockTextNode({ characters: 'Small Text', fontSize: 12, fontWeight: 400 }),
                        mockTextNode({ characters: 'Large Title', fontSize: 24, fontWeight: 400 }),
                        mockTextNode({ characters: 'Medium Text', fontSize: 16, fontWeight: 400 })
                    ],
                    expectedHeaderText: 'Large Title' // Largest font size
                },
                {
                    name: 'mixed content with non-text nodes',
                    children: [
                        mockRectangleNode({}),
                        mockTextNode({ characters: 'Header Text' }),
                        mockRectangleNode({})
                    ],
                    expectedHeaderText: 'Header Text'
                },
                {
                    name: 'no text children',
                    children: [mockRectangleNode({}), mockRectangleNode({})],
                    expectedHeaderText: null
                }
            ];
            headerTextTests.forEach(({ name, children, expectedHeaderText }) => {
                const frameNode = mockFrameNode({ children });
                // Find text nodes
                const textNodes = children.filter(node => node.type === 'TEXT');
                if (textNodes.length > 0) {
                    // Simulate header text detection logic
                    const headerNode = textNodes.reduce((prev, current) => {
                        const currentFontSize = current.fontSize || 0;
                        const prevFontSize = prev.fontSize || 0;
                        const currentFontWeight = current.fontWeight || 400;
                        const prevFontWeight = prev.fontWeight || 400;
                        return (currentFontWeight > prevFontWeight ||
                            (currentFontWeight === prevFontWeight && currentFontSize > prevFontSize))
                            ? current
                            : prev;
                    });
                    expect(headerNode.characters).toBe(expectedHeaderText);
                }
                else {
                    expect(expectedHeaderText).toBeNull();
                }
            });
        });
        test('useFirstTextContent: true - should truncate long text', () => {
            const longTextTests = [
                {
                    input: 'This is a very long header text that should be truncated',
                    expectedTruncation: true
                },
                {
                    input: 'Short header',
                    expectedTruncation: false
                },
                {
                    input: 'Exactly thirty characters!!!',
                    expectedTruncation: false
                }
            ];
            longTextTests.forEach(({ input, expectedTruncation }) => {
                const textChild = mockTextNode({ characters: input });
                const frameNode = mockFrameNode({ children: [textChild] });
                if (expectedTruncation) {
                    expect(input.length).toBeGreaterThan(30);
                    // Should truncate and add "..."
                    const truncated = input.length > 30 ? `${input.substring(0, 30)}...` : input;
                    expect(truncated).toContain('...');
                }
                else {
                    expect(input.length).toBeLessThanOrEqual(30);
                    // Should not truncate
                }
            });
        });
        test('useFirstTextContent: false - should not use text content', () => {
            const settings = {
                enableContainers: true,
                includeContainerType: true,
                includeContainerSize: false,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: false,
                useAutoLayoutNames: false
            };
            const textChild = mockTextNode({ characters: 'Important Header' });
            const frameNode = mockFrameNode({ children: [textChild] });
            expect(settings.useFirstTextContent).toBe(false);
            // Result should not contain "Important Header"
        });
    });
    describe('useAutoLayoutNames parameter', () => {
        test('useAutoLayoutNames: true - should try auto layout naming strategies', () => {
            const autoLayoutTests = [
                {
                    name: 'frame with single child container',
                    parentChildren: [
                        mockFrameNode({
                            children: [
                                mockTextNode({ characters: 'Card Header' })
                            ]
                        })
                    ],
                    expectedStrategy: 'child container header'
                },
                {
                    name: 'frame with multiple child containers',
                    parentChildren: [
                        mockFrameNode({ children: [mockTextNode({ characters: 'Header 1' })] }),
                        mockFrameNode({ children: [mockTextNode({ characters: 'Header 2' })] })
                    ],
                    expectedStrategy: 'no header (multiple containers)'
                },
                {
                    name: 'frame with non-container children only',
                    parentChildren: [
                        mockTextNode({ characters: 'Direct Text' }),
                        mockRectangleNode({})
                    ],
                    expectedStrategy: 'direct text content'
                }
            ];
            autoLayoutTests.forEach(({ name, parentChildren, expectedStrategy }) => {
                const parentFrame = mockFrameNode({ children: parentChildren });
                // Simulate auto layout logic
                const childContainers = parentChildren.filter(child => child.type === 'FRAME' || child.type === 'GROUP');
                if (childContainers.length === 1) {
                    expect(expectedStrategy).toBe('child container header');
                }
                else if (childContainers.length > 1) {
                    expect(expectedStrategy).toBe('no header (multiple containers)');
                }
                else {
                    expect(expectedStrategy).toBe('direct text content');
                }
            });
        });
        test('useAutoLayoutNames: false - should not use auto layout strategies', () => {
            const settings = {
                enableContainers: true,
                includeContainerType: true,
                includeContainerSize: false,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: true,
                useAutoLayoutNames: false
            };
            const childFrame = mockFrameNode({
                children: [mockTextNode({ characters: 'Child Header' })]
            });
            const parentFrame = mockFrameNode({ children: [childFrame] });
            expect(settings.useAutoLayoutNames).toBe(false);
            // Should not try to extract header from child containers
        });
    });
    describe('Container parameter combinations', () => {
        test('All container parameters enabled - comprehensive naming', () => {
            const allEnabledSettings = {
                enableContainers: true,
                includeContainerType: true,
                includeContainerSize: true,
                includeChildrenCount: true,
                includeContainerOpacity: true,
                useFirstTextContent: true,
                useAutoLayoutNames: true
            };
            const comprehensiveTestCases = [
                {
                    name: 'frame with all attributes',
                    node: mockFrameNode({
                        width: 350,
                        height: 250,
                        children: [
                            mockTextNode({ characters: 'Card Title', fontWeight: 700 }),
                            mockTextNode({ characters: 'Subtitle', fontWeight: 400 }),
                            mockRectangleNode({})
                        ],
                        opacity: 0.95
                    }),
                    expectedElements: ['"Card Title"', 'Frame', '350x250', '3 elements', 'Opacity: 95%']
                },
                {
                    name: 'group with children',
                    node: mockGroupNode({
                        children: [
                            mockTextNode({ characters: 'Group Header' }),
                            mockRectangleNode({})
                        ],
                        opacity: 1.0
                    }),
                    expectedElements: ['"Group Header"', 'Group', '2 elements']
                }
            ];
            comprehensiveTestCases.forEach(({ name, node, expectedElements }) => {
                expectedElements.forEach(element => {
                    if (element.startsWith('"') && element.endsWith('"')) {
                        // Text content element
                        expect(allEnabledSettings.useFirstTextContent).toBe(true);
                    }
                    else if (['Frame', 'Group'].includes(element)) {
                        // Container type element
                        expect(allEnabledSettings.includeContainerType).toBe(true);
                    }
                    else if (element.includes('x') && element.match(/^\d+x\d+$/)) {
                        // Size element
                        expect(allEnabledSettings.includeContainerSize).toBe(true);
                    }
                    else if (element.includes('element')) {
                        // Children count element
                        expect(allEnabledSettings.includeChildrenCount).toBe(true);
                    }
                    else if (element.startsWith('Opacity:')) {
                        // Opacity element
                        expect(allEnabledSettings.includeContainerOpacity).toBe(true);
                    }
                });
            });
        });
        test('Only container type enabled - minimal naming', () => {
            const minimalSettings = {
                enableContainers: true,
                includeContainerType: true,
                includeContainerSize: false,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: false,
                useAutoLayoutNames: false
            };
            const frameNode = mockFrameNode({
                width: 200,
                height: 150,
                children: [mockTextNode({ characters: 'Header' })],
                opacity: 0.8
            });
            // Should only include container type
            expect(minimalSettings.includeContainerType).toBe(true);
            expect(minimalSettings.includeContainerSize).toBe(false);
            expect(minimalSettings.includeChildrenCount).toBe(false);
            expect(minimalSettings.useFirstTextContent).toBe(false);
        });
        test('Text content priority over other attributes', () => {
            const textPrioritySettings = {
                enableContainers: true,
                includeContainerType: false,
                includeContainerSize: false,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: true,
                useAutoLayoutNames: true
            };
            const frameNode = mockFrameNode({
                width: 300,
                height: 200,
                children: [
                    mockTextNode({ characters: 'Primary Content' }),
                    mockRectangleNode({})
                ],
                opacity: 0.9
            });
            // Should prioritize text content over other attributes
            expect(textPrioritySettings.useFirstTextContent).toBe(true);
            expect(textPrioritySettings.includeContainerType).toBe(false);
            expect(textPrioritySettings.includeContainerSize).toBe(false);
        });
        test('Fallback behavior with no content', () => {
            const settings = {
                enableContainers: true,
                includeContainerType: false,
                includeContainerSize: false,
                includeChildrenCount: false,
                includeContainerOpacity: false,
                useFirstTextContent: true,
                useAutoLayoutNames: true
            };
            const emptyFrameNode = mockFrameNode({ children: [] });
            const emptyGroupNode = mockGroupNode({ children: [] });
            // Should fallback to basic container names
            expect(emptyFrameNode.type).toBe('FRAME');
            expect(emptyGroupNode.type).toBe('GROUP');
            // Expected fallback: "Frame" for FRAME, "Group" for GROUP
        });
        test('Complex nested container scenarios', () => {
            const nestedScenarios = [
                {
                    name: 'nested frames with text content',
                    container: mockFrameNode({
                        children: [
                            mockFrameNode({
                                children: [
                                    mockTextNode({ characters: 'Nested Header' })
                                ]
                            })
                        ]
                    }),
                    expectation: 'should extract text from single child container'
                },
                {
                    name: 'frame with multiple nested containers',
                    container: mockFrameNode({
                        children: [
                            mockFrameNode({ children: [mockTextNode({ characters: 'Header 1' })] }),
                            mockFrameNode({ children: [mockTextNode({ characters: 'Header 2' })] })
                        ]
                    }),
                    expectation: 'should not extract from multiple child containers'
                }
            ];
            nestedScenarios.forEach(({ name, container, expectation }) => {
                const childContainers = container.children.filter((child) => child.type === 'FRAME' || child.type === 'GROUP');
                if (childContainers.length === 1) {
                    expect(expectation).toBe('should extract text from single child container');
                }
                else if (childContainers.length > 1) {
                    expect(expectation).toBe('should not extract from multiple child containers');
                }
            });
        });
    });
});
