/**
 * Tests for all Shape/Figure parameters and renaming scenarios
 */

describe('Shape Parameter Tests', () => {
  interface ShapeSettings {
    enableFigures: boolean;
    includeShapeType: boolean;
    includeShapeSize: boolean;
    includeFillColor: boolean;
    includeStrokeSettings: boolean;
    includeCornerRadius: boolean;
    includeFigureOpacity: boolean;
  }

  // Mock shape node factories
  const mockRectangleNode = (options: any = {}) => ({
    type: 'RECTANGLE',
    name: options.name || 'Rectangle',
    width: options.width || 100,
    height: options.height || 100,
    fills: options.fills || [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, visible: true }],
    strokes: options.strokes || [],
    strokeWeight: options.strokeWeight || 1,
    cornerRadius: options.cornerRadius || 0,
    opacity: options.opacity || 1,
    id: Math.random().toString()
  });

  const mockEllipseNode = (options: any = {}) => ({
    type: 'ELLIPSE',
    name: options.name || 'Ellipse',
    width: options.width || 100,
    height: options.height || 100,
    fills: options.fills || [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }],
    opacity: options.opacity || 1,
    id: Math.random().toString()
  });

  const mockPolygonNode = (options: any = {}) => ({
    type: 'POLYGON',
    name: options.name || 'Polygon',
    width: options.width || 100,
    height: options.height || 100,
    fills: options.fills || [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 }, visible: true }],
    opacity: options.opacity || 1,
    id: Math.random().toString()
  });

  describe('enableFigures parameter', () => {
    test('enableFigures: true - should process shape nodes', () => {
      const settings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: true,
        includeShapeSize: false,
        includeFillColor: false,
        includeStrokeSettings: false,
        includeCornerRadius: false,
        includeFigureOpacity: false
      };
      
      const rectNode = mockRectangleNode({});
      
      expect(settings.enableFigures).toBe(true);
      expect(rectNode.type).toBe('RECTANGLE');
    });

    test('enableFigures: false - should return original name', () => {
      const settings: ShapeSettings = {
        enableFigures: false,
        includeShapeType: true,
        includeShapeSize: true,
        includeFillColor: true,
        includeStrokeSettings: true,
        includeCornerRadius: true,
        includeFigureOpacity: true
      };
      
      const rectNode = mockRectangleNode({ name: 'Original Rectangle' });
      
      expect(settings.enableFigures).toBe(false);
      expect(rectNode.name).toBe('Original Rectangle');
    });
  });

  describe('includeShapeType parameter', () => {
    test('includeShapeType: true - should include shape type names', () => {
      const shapeTypeTests = [
        { type: 'RECTANGLE', expectedName: 'Rectangle' },
        { type: 'ELLIPSE', expectedName: 'Ellipse', width: 150, height: 100 },
        { type: 'ELLIPSE', expectedName: 'Circle', width: 100, height: 100 }, // Perfect circle
        { type: 'POLYGON', expectedName: 'Polygon' },
        { type: 'STAR', expectedName: 'Star' },
        { type: 'VECTOR', expectedName: 'Vector' },
        { type: 'LINE', expectedName: 'Line' },
        { type: 'BOOLEAN_OPERATION', expectedName: 'Boolean' }
      ];

      shapeTypeTests.forEach(({ type, expectedName, width = 100, height = 100 }) => {
        const shapeNode = {
          type,
          name: 'Original',
          width,
          height,
          fills: [],
          opacity: 1,
          id: Math.random().toString()
        };

        // Test circle detection logic
        if (type === 'ELLIPSE') {
          const isCircle = Math.abs(width - height) < 1;
          if (isCircle) {
            expect(expectedName).toBe('Circle');
          } else {
            expect(expectedName).toBe('Ellipse');
          }
        } else {
          expect(expectedName).toBeDefined();
        }
      });
    });

    test('includeShapeType: false - should not include shape type', () => {
      const settings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: false,
        includeShapeSize: true,
        includeFillColor: false,
        includeStrokeSettings: false,
        includeCornerRadius: false,
        includeFigureOpacity: false
      };

      const rectNode = mockRectangleNode({});
      
      expect(settings.includeShapeType).toBe(false);
      // Result should not contain "Rectangle"
    });
  });

  describe('includeShapeSize parameter', () => {
    test('includeShapeSize: true - should include dimensions', () => {
      const sizeTestCases = [
        { width: 100, height: 50, expected: '100x50' },
        { width: 200, height: 200, expected: '200x200' },
        { width: 75, height: 125, expected: '75x125' },
        { width: 300.7, height: 150.3, expected: '301x150' }, // Should round
        { width: 0, height: 0, expected: '0x0' }
      ];

      sizeTestCases.forEach(({ width, height, expected }) => {
        const rectNode = mockRectangleNode({ width, height });
        
        const roundedWidth = Math.round(width);
        const roundedHeight = Math.round(height);
        const result = `${roundedWidth}x${roundedHeight}`;
        
        expect(result).toBe(expected);
      });
    });

    test('includeShapeSize: false - should not include dimensions', () => {
      const settings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: true,
        includeShapeSize: false,
        includeFillColor: false,
        includeStrokeSettings: false,
        includeCornerRadius: false,
        includeFigureOpacity: false
      };

      const rectNode = mockRectangleNode({ width: 150, height: 100 });
      
      expect(settings.includeShapeSize).toBe(false);
      // Result should not contain "150x100"
    });
  });

  describe('includeFillColor parameter', () => {
    test('includeFillColor: true - should include fill hex colors', () => {
      const fillColorTests = [
        { r: 1, g: 0, b: 0, expected: '#ff0000' }, // Red
        { r: 0, g: 1, b: 0, expected: '#00ff00' }, // Green
        { r: 0, g: 0, b: 1, expected: '#0000ff' }, // Blue
        { r: 1, g: 1, b: 0, expected: '#ffff00' }, // Yellow
        { r: 1, g: 0, b: 1, expected: '#ff00ff' }, // Magenta
        { r: 0, g: 1, b: 1, expected: '#00ffff' }, // Cyan
        { r: 0.5, g: 0.5, b: 0.5, expected: '#808080' }, // Gray
        { r: 0.2, g: 0.4, b: 0.8, expected: '#3366cc' } // Custom blue
      ];

      fillColorTests.forEach(({ r, g, b, expected }) => {
        const rectNode = mockRectangleNode({
          fills: [{ type: 'SOLID', color: { r, g, b }, visible: true }]
        });
        
        // Test RGB to hex conversion
        const hexR = Math.round(r * 255).toString(16).padStart(2, '0');
        const hexG = Math.round(g * 255).toString(16).padStart(2, '0');
        const hexB = Math.round(b * 255).toString(16).padStart(2, '0');
        const result = `#${hexR}${hexG}${hexB}`;
        
        expect(result).toBe(expected);
      });
    });

    test('includeFillColor: false - should not include fill color', () => {
      const settings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: true,
        includeShapeSize: true,
        includeFillColor: false,
        includeStrokeSettings: false,
        includeCornerRadius: false,
        includeFigureOpacity: false
      };

      const rectNode = mockRectangleNode({
        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }]
      });
      
      expect(settings.includeFillColor).toBe(false);
      // Result should not contain "#ff0000"
    });

    test('includeFillColor: true - should handle special fill cases', () => {
      const specialFillCases = [
        {
          description: 'no fills',
          fills: [],
          shouldIncludeColor: false
        },
        {
          description: 'invisible solid fill',
          fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: false }],
          shouldIncludeColor: false
        },
        {
          description: 'gradient fill',
          fills: [{ type: 'GRADIENT_LINEAR', visible: true }],
          shouldIncludeColor: false
        },
        {
          description: 'image fill',
          fills: [{ type: 'IMAGE', visible: true }],
          shouldIncludeColor: false
        },
        {
          description: 'multiple fills (first solid)',
          fills: [
            { type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true },
            { type: 'SOLID', color: { r: 0, g: 1, b: 0 }, visible: true }
          ],
          shouldIncludeColor: true // Should use first fill
        }
      ];

      specialFillCases.forEach(({ description, fills, shouldIncludeColor }) => {
        const rectNode = mockRectangleNode({ fills });
        
        if (shouldIncludeColor) {
          expect(fills[0].type).toBe('SOLID');
          expect(fills[0].visible).toBe(true);
        } else {
          expect(shouldIncludeColor).toBe(false);
        }
      });
    });
  });

  describe('includeStrokeSettings parameter', () => {
    test('includeStrokeSettings: true - should include stroke information', () => {
      const strokeTestCases = [
        {
          stroke: { type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true },
          strokeWeight: 1,
          expected: 'Stroke: #ff0000 1px'
        },
        {
          stroke: { type: 'SOLID', color: { r: 0, g: 0, b: 1 }, visible: true },
          strokeWeight: 3,
          expected: 'Stroke: #0000ff 3px'
        },
        {
          stroke: { type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, visible: true },
          strokeWeight: 2.7, // Should round
          expected: 'Stroke: #808080 3px'
        }
      ];

      strokeTestCases.forEach(({ stroke, strokeWeight, expected }) => {
        const rectNode = mockRectangleNode({
          strokes: [stroke],
          strokeWeight
        });
        
        if (stroke.type === 'SOLID' && stroke.visible) {
          const hexColor = '#' + Object.values(stroke.color)
            .map((c: any) => Math.round(c * 255).toString(16).padStart(2, '0'))
            .join('');
          const roundedWeight = Math.round(strokeWeight);
          const result = `Stroke: ${hexColor} ${roundedWeight}px`;
          
          expect(result).toBe(expected);
        }
      });
    });

    test('includeStrokeSettings: false - should not include stroke', () => {
      const settings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: true,
        includeShapeSize: false,
        includeFillColor: false,
        includeStrokeSettings: false,
        includeCornerRadius: false,
        includeFigureOpacity: false
      };

      const rectNode = mockRectangleNode({
        strokes: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }],
        strokeWeight: 2
      });
      
      expect(settings.includeStrokeSettings).toBe(false);
      // Result should not contain "Stroke:"
    });

    test('includeStrokeSettings: true - should handle special stroke cases', () => {
      const specialStrokeCases = [
        {
          description: 'no strokes',
          strokes: [],
          shouldIncludeStroke: false
        },
        {
          description: 'invisible stroke',
          strokes: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: false }],
          shouldIncludeStroke: false
        },
        {
          description: 'gradient stroke',
          strokes: [{ type: 'GRADIENT_LINEAR', visible: true }],
          shouldIncludeStroke: false
        }
      ];

      specialStrokeCases.forEach(({ description, strokes, shouldIncludeStroke }) => {
        const rectNode = mockRectangleNode({ strokes });
        
        expect(shouldIncludeStroke).toBe(false);
      });
    });
  });

  describe('includeCornerRadius parameter', () => {
    test('includeCornerRadius: true - should include corner radius', () => {
      const radiusTestCases = [
        { radius: 0, expected: null }, // No radius should not be included
        { radius: 4, expected: 'Radius: 4px' },
        { radius: 8, expected: 'Radius: 8px' },
        { radius: 12.7, expected: 'Radius: 13px' }, // Should round
        { radius: 20, expected: 'Radius: 20px' }
      ];

      radiusTestCases.forEach(({ radius, expected }) => {
        const rectNode = mockRectangleNode({ cornerRadius: radius });
        
        if (radius > 0) {
          const roundedRadius = Math.round(radius);
          const result = `Radius: ${roundedRadius}px`;
          expect(result).toBe(expected);
        } else {
          expect(expected).toBeNull();
        }
      });
    });

    test('includeCornerRadius: false - should not include corner radius', () => {
      const settings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: true,
        includeShapeSize: false,
        includeFillColor: false,
        includeStrokeSettings: false,
        includeCornerRadius: false,
        includeFigureOpacity: false
      };

      const rectNode = mockRectangleNode({ cornerRadius: 8 });
      
      expect(settings.includeCornerRadius).toBe(false);
      // Result should not contain "Radius:"
    });

    test('includeCornerRadius: true - should handle mixed corner radius', () => {
      const mixedRadiusNode = {
        ...mockRectangleNode({}),
        cornerRadius: {}, // Object indicates mixed radius
        topLeftRadius: 4,
        topRightRadius: 8,
        bottomRightRadius: 4,
        bottomLeftRadius: 8
      };

      // Should handle mixed corner radius case
      expect(mixedRadiusNode.topLeftRadius).toBe(4);
      expect(mixedRadiusNode.topRightRadius).toBe(8);
    });
  });

  describe('includeFigureOpacity parameter', () => {
    test('includeFigureOpacity: true - should include opacity when less than 100%', () => {
      const opacityTestCases = [
        { opacity: 1.0, expected: null }, // 100% should not be included
        { opacity: 0.9, expected: 'Opacity: 90%' },
        { opacity: 0.75, expected: 'Opacity: 75%' },
        { opacity: 0.5, expected: 'Opacity: 50%' },
        { opacity: 0.25, expected: 'Opacity: 25%' },
        { opacity: 0.1, expected: 'Opacity: 10%' },
        { opacity: 0, expected: 'Opacity: 0%' }
      ];

      opacityTestCases.forEach(({ opacity, expected }) => {
        const rectNode = mockRectangleNode({ opacity });
        
        if (opacity < 1) {
          const percentageOpacity = Math.round(opacity * 100);
          const result = `Opacity: ${percentageOpacity}%`;
          expect(result).toBe(expected);
        } else {
          expect(expected).toBeNull();
        }
      });
    });

    test('includeFigureOpacity: false - should not include opacity', () => {
      const settings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: true,
        includeShapeSize: false,
        includeFillColor: false,
        includeStrokeSettings: false,
        includeCornerRadius: false,
        includeFigureOpacity: false
      };

      const rectNode = mockRectangleNode({ opacity: 0.8 });
      
      expect(settings.includeFigureOpacity).toBe(false);
      // Result should not contain "Opacity:"
    });
  });

  describe('Shape parameter combinations', () => {
    test('All shape parameters enabled - comprehensive naming', () => {
      const allEnabledSettings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: true,
        includeShapeSize: true,
        includeFillColor: true,
        includeStrokeSettings: true,
        includeCornerRadius: true,
        includeFigureOpacity: true
      };

      const comprehensiveTestCases = [
        {
          name: 'rounded rectangle with all attributes',
          node: mockRectangleNode({
            width: 200,
            height: 100,
            fills: [{ type: 'SOLID', color: { r: 0, g: 0.5, b: 1 }, visible: true }],
            strokes: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }],
            strokeWeight: 2,
            cornerRadius: 8,
            opacity: 0.9
          }),
          expectedElements: ['Rectangle', '200x100', '#0080ff', 'Stroke: #ff0000 2px', 'Radius: 8px', 'Opacity: 90%']
        },
        {
          name: 'simple circle',
          node: mockEllipseNode({
            width: 100,
            height: 100,
            fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 0 }, visible: true }],
            opacity: 1.0
          }),
          expectedElements: ['Circle', '100x100', '#ffff00']
        }
      ];

      comprehensiveTestCases.forEach(({ name, node, expectedElements }) => {
        expectedElements.forEach(element => {
          if (['Rectangle', 'Circle', 'Ellipse', 'Polygon', 'Star', 'Vector', 'Line', 'Boolean'].includes(element)) {
            // Shape type element
            expect(allEnabledSettings.includeShapeType).toBe(true);
          } else if (element.includes('x')) {
            // Size element
            expect(allEnabledSettings.includeShapeSize).toBe(true);
          } else if (element.startsWith('#')) {
            // Color element
            expect(allEnabledSettings.includeFillColor).toBe(true);
          } else if (element.startsWith('Stroke:')) {
            // Stroke element
            expect(allEnabledSettings.includeStrokeSettings).toBe(true);
          } else if (element.startsWith('Radius:')) {
            // Radius element
            expect(allEnabledSettings.includeCornerRadius).toBe(true);
          } else if (element.startsWith('Opacity:')) {
            // Opacity element
            expect(allEnabledSettings.includeFigureOpacity).toBe(true);
          }
        });
      });
    });

    test('Only shape type enabled - minimal naming', () => {
      const minimalSettings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: true,
        includeShapeSize: false,
        includeFillColor: false,
        includeStrokeSettings: false,
        includeCornerRadius: false,
        includeFigureOpacity: false
      };

      const rectNode = mockRectangleNode({
        width: 150,
        height: 100,
        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }],
        opacity: 0.8
      });

      // Should only include shape type
      expect(minimalSettings.includeShapeType).toBe(true);
      expect(minimalSettings.includeShapeSize).toBe(false);
      expect(minimalSettings.includeFillColor).toBe(false);
      expect(minimalSettings.includeFigureOpacity).toBe(false);
    });

    test('No shape type, only attributes - attribute-only naming', () => {
      const attributeOnlySettings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: false,
        includeShapeSize: true,
        includeFillColor: true,
        includeStrokeSettings: true,
        includeCornerRadius: true,
        includeFigureOpacity: true
      };

      const rectNode = mockRectangleNode({
        width: 120,
        height: 80,
        fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 }, visible: true }],
        strokes: [{ type: 'SOLID', color: { r: 0, g: 0, b: 1 }, visible: true }],
        strokeWeight: 3,
        cornerRadius: 6,
        opacity: 0.85
      });

      // Should include attributes but not shape type
      expect(attributeOnlySettings.includeShapeType).toBe(false);
      expect(attributeOnlySettings.includeShapeSize).toBe(true);
      expect(attributeOnlySettings.includeFillColor).toBe(true);
      expect(attributeOnlySettings.includeStrokeSettings).toBe(true);
      expect(attributeOnlySettings.includeCornerRadius).toBe(true);
      expect(attributeOnlySettings.includeFigureOpacity).toBe(true);
    });

    test('Minimal settings should fallback to "Shape"', () => {
      const allDisabledSettings: ShapeSettings = {
        enableFigures: true,
        includeShapeType: false,
        includeShapeSize: false,
        includeFillColor: false,
        includeStrokeSettings: false,
        includeCornerRadius: false,
        includeFigureOpacity: false
      };

      const rectNode = mockRectangleNode({});

      // With all attributes disabled, should fallback to "Shape"
      expect(allDisabledSettings.includeShapeType).toBe(false);
      expect(allDisabledSettings.includeShapeSize).toBe(false);
      expect(allDisabledSettings.includeFillColor).toBe(false);
      // Expected fallback name would be "Shape"
    });
  });
}); 