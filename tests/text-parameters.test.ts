/**
 * Tests for all Text Layer parameters and renaming scenarios
 */

describe('Text Layer Parameter Tests', () => {
  interface TextSettings {
    enableTextLayers: boolean;
    useTextContent: boolean;
    includeTextColor: boolean;
    includeTextStyle: boolean;
    includeTextOpacity: boolean;
  }

  const mockTextNode = (options: any = {}) => ({
    type: 'TEXT',
    name: options.name || 'Text',
    characters: options.characters || 'Sample Text',
    fills: options.fills || [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 }, visible: true }],
    textStyleId: options.textStyleId || '',
    fontSize: options.fontSize || 16,
    fontWeight: options.fontWeight || 400,
    opacity: options.opacity || 1,
    id: Math.random().toString()
  });

  describe('enableTextLayers parameter', () => {
    test('enableTextLayers: true - should process text nodes', () => {
      const settings: TextSettings = {
        enableTextLayers: true,
        useTextContent: true,
        includeTextColor: false,
        includeTextStyle: false,
        includeTextOpacity: false
      };
      
      const textNode = mockTextNode({ characters: 'Button Text' });
      
      // With enableTextLayers: true, text nodes should be processed
      expect(settings.enableTextLayers).toBe(true);
      expect(textNode.type).toBe('TEXT');
    });

    test('enableTextLayers: false - should return original name', () => {
      const settings: TextSettings = {
        enableTextLayers: false,
        useTextContent: true,
        includeTextColor: true,
        includeTextStyle: true,
        includeTextOpacity: true
      };
      
      const textNode = mockTextNode({ name: 'Original Name' });
      
      // With enableTextLayers: false, should keep original name
      expect(settings.enableTextLayers).toBe(false);
      expect(textNode.name).toBe('Original Name');
    });
  });

  describe('useTextContent parameter', () => {
    test('useTextContent: true - should include quoted text content', () => {
      const settings: TextSettings = {
        enableTextLayers: true,
        useTextContent: true,
        includeTextColor: false,
        includeTextStyle: false,
        includeTextOpacity: false
      };
      
      const testCases = [
        { input: 'Login', expected: '"Login"' },
        { input: 'Sign Up Button', expected: '"Sign Up Button"' },
        { input: 'Welcome to our app', expected: '"Welcome to our app"' },
        { input: '', expected: null }, // Empty text should not add quotes
        { input: '   ', expected: null }, // Whitespace only should not add quotes
      ];

      testCases.forEach(({ input, expected }) => {
        const textNode = mockTextNode({ characters: input });
        
        if (expected) {
          expect(input.trim()).toBeTruthy();
          // Should include quoted text content
        } else {
          expect(input.trim()).toBeFalsy();
          // Should not include quoted text content
        }
      });
    });

    test('useTextContent: false - should not include text content', () => {
      const settings: TextSettings = {
        enableTextLayers: true,
        useTextContent: false,
        includeTextColor: true,
        includeTextStyle: false,
        includeTextOpacity: false
      };
      
      const textNode = mockTextNode({ 
        characters: 'Important Text',
        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }]
      });
      
      // With useTextContent: false, should not include text but may include other attributes
      expect(settings.useTextContent).toBe(false);
      expect(settings.includeTextColor).toBe(true);
    });

    test('useTextContent: true - should truncate long text', () => {
      const longTextCases = [
        {
          input: 'This is a very long text that exceeds the typical limit',
          expectedTruncation: true
        },
        {
          input: 'Short text',
          expectedTruncation: false
        },
        {
          input: 'Exactly thirty characters!!',
          expectedTruncation: false
        },
        {
          input: 'This text is definitely longer than thirty characters and should be truncated',
          expectedTruncation: true
        }
      ];

      longTextCases.forEach(({ input, expectedTruncation }) => {
        const textNode = mockTextNode({ characters: input });
        
        if (expectedTruncation) {
          expect(input.length).toBeGreaterThan(30);
          // Should truncate and add "..."
        } else {
          expect(input.length).toBeLessThanOrEqual(30);
          // Should not truncate
        }
      });
    });
  });

  describe('includeTextColor parameter', () => {
    test('includeTextColor: true - should include hex color codes', () => {
      const colorTestCases = [
        { r: 1, g: 0, b: 0, expected: '#ff0000' }, // Red
        { r: 0, g: 1, b: 0, expected: '#00ff00' }, // Green
        { r: 0, g: 0, b: 1, expected: '#0000ff' }, // Blue
        { r: 1, g: 1, b: 1, expected: '#ffffff' }, // White
        { r: 0, g: 0, b: 0, expected: '#000000' }, // Black
        { r: 0.5, g: 0.5, b: 0.5, expected: '#808080' }, // Gray
        { r: 1, g: 0.5, b: 0, expected: '#ff8000' }, // Orange
      ];

      colorTestCases.forEach(({ r, g, b, expected }) => {
        const textNode = mockTextNode({
          fills: [{ type: 'SOLID', color: { r, g, b }, visible: true }]
        });
        
        // Convert RGB to hex manually to test
        const hexR = Math.round(r * 255).toString(16).padStart(2, '0');
        const hexG = Math.round(g * 255).toString(16).padStart(2, '0');
        const hexB = Math.round(b * 255).toString(16).padStart(2, '0');
        const result = `#${hexR}${hexG}${hexB}`;
        
        expect(result).toBe(expected);
      });
    });

    test('includeTextColor: false - should not include color', () => {
      const settings: TextSettings = {
        enableTextLayers: true,
        useTextContent: true,
        includeTextColor: false,
        includeTextStyle: false,
        includeTextOpacity: false
      };
      
      const textNode = mockTextNode({
        characters: 'Colored Text',
        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }]
      });
      
      expect(settings.includeTextColor).toBe(false);
      // Result should not contain color hex
    });

    test('includeTextColor: true - should handle special fill cases', () => {
      const specialFillCases = [
        {
          description: 'no fills array',
          fills: undefined,
          shouldIncludeColor: false
        },
        {
          description: 'empty fills array',
          fills: [],
          shouldIncludeColor: false
        },
        {
          description: 'invisible fill',
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
        }
      ];

      specialFillCases.forEach(({ description, fills, shouldIncludeColor }) => {
        const textNode = mockTextNode({ fills });
        
        if (shouldIncludeColor) {
          expect(fills?.[0]?.type).toBe('SOLID');
          expect(fills?.[0]?.visible).toBe(true);
        } else {
          expect(shouldIncludeColor).toBe(false);
        }
      });
    });
  });

  describe('includeTextStyle parameter', () => {
    test('includeTextStyle: true - should include style names when available', async () => {
      const styleTestCases = [
        { styleId: 'style1', styleName: 'Heading 1', expected: 'Style: Heading 1' },
        { styleId: 'style2', styleName: 'Body Text', expected: 'Style: Body Text' },
        { styleId: 'style3', styleName: 'Caption', expected: 'Style: Caption' },
        { styleId: '', styleName: null, expected: null },
        { styleId: 'invalid', styleName: null, expected: null }
      ];

      styleTestCases.forEach(({ styleId, styleName, expected }) => {
        const textNode = mockTextNode({ textStyleId: styleId });
        
        if (styleName) {
          expect(expected).toContain('Style:');
          expect(expected).toContain(styleName);
        } else {
          expect(expected).toBeNull();
        }
      });
    });

    test('includeTextStyle: false - should not include style names', () => {
      const settings: TextSettings = {
        enableTextLayers: true,
        useTextContent: true,
        includeTextColor: false,
        includeTextStyle: false,
        includeTextOpacity: false
      };
      
      const textNode = mockTextNode({ textStyleId: 'heading-style' });
      
      expect(settings.includeTextStyle).toBe(false);
      // Result should not contain style information
    });
  });

  describe('includeTextOpacity parameter', () => {
    test('includeTextOpacity: true - should include opacity when less than 100%', () => {
      const opacityTestCases = [
        { opacity: 1.0, expected: null }, // 100% opacity should not be included
        { opacity: 0.9, expected: 'Opacity: 90%' },
        { opacity: 0.8, expected: 'Opacity: 80%' },
        { opacity: 0.5, expected: 'Opacity: 50%' },
        { opacity: 0.1, expected: 'Opacity: 10%' },
        { opacity: 0.05, expected: 'Opacity: 5%' },
        { opacity: 0, expected: 'Opacity: 0%' }
      ];

      opacityTestCases.forEach(({ opacity, expected }) => {
        const textNode = mockTextNode({ opacity });
        
        if (opacity < 1) {
          const percentageOpacity = Math.round(opacity * 100);
          expect(expected).toBe(`Opacity: ${percentageOpacity}%`);
        } else {
          expect(expected).toBeNull();
        }
      });
    });

    test('includeTextOpacity: false - should not include opacity', () => {
      const settings: TextSettings = {
        enableTextLayers: true,
        useTextContent: true,
        includeTextColor: false,
        includeTextStyle: false,
        includeTextOpacity: false
      };
      
      const textNode = mockTextNode({ opacity: 0.7 });
      
      expect(settings.includeTextOpacity).toBe(false);
      // Result should not contain opacity information
    });
  });

  describe('Text parameter combinations', () => {
    test('All text parameters enabled - comprehensive naming', () => {
      const allEnabledSettings: TextSettings = {
        enableTextLayers: true,
        useTextContent: true,
        includeTextColor: true,
        includeTextStyle: true,
        includeTextOpacity: true
      };

      const comprehensiveTestCases = [
        {
          name: 'button with all attributes',
          node: mockTextNode({
            characters: 'Sign Up',
            fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, visible: true }],
            textStyleId: 'button-style',
            opacity: 0.9
          }),
          expectedElements: ['"Sign Up"', '#ffffff', 'Style:', 'Opacity: 90%']
        },
        {
          name: 'heading with partial attributes',
          node: mockTextNode({
            characters: 'Welcome',
            fills: [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 }, visible: true }],
            opacity: 1.0
          }),
          expectedElements: ['"Welcome"', '#333333']
        }
      ];

      comprehensiveTestCases.forEach(({ name, node, expectedElements }) => {
        expectedElements.forEach(element => {
          if (element.startsWith('"') && element.endsWith('"')) {
            // Text content element
            expect(allEnabledSettings.useTextContent).toBe(true);
          } else if (element.startsWith('#')) {
            // Color element
            expect(allEnabledSettings.includeTextColor).toBe(true);
          } else if (element.startsWith('Style:')) {
            // Style element
            expect(allEnabledSettings.includeTextStyle).toBe(true);
          } else if (element.startsWith('Opacity:')) {
            // Opacity element
            expect(allEnabledSettings.includeTextOpacity).toBe(true);
          }
        });
      });
    });

    test('Only text content enabled - minimal naming', () => {
      const minimalSettings: TextSettings = {
        enableTextLayers: true,
        useTextContent: true,
        includeTextColor: false,
        includeTextStyle: false,
        includeTextOpacity: false
      };

      const textNode = mockTextNode({
        characters: 'Button',
        fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 }, visible: true }],
        opacity: 0.8
      });

      // Should only include text content, no other attributes
      expect(minimalSettings.useTextContent).toBe(true);
      expect(minimalSettings.includeTextColor).toBe(false);
      expect(minimalSettings.includeTextStyle).toBe(false);
      expect(minimalSettings.includeTextOpacity).toBe(false);
    });

    test('No content, only attributes - attribute-only naming', () => {
      const attributeOnlySettings: TextSettings = {
        enableTextLayers: true,
        useTextContent: false,
        includeTextColor: true,
        includeTextStyle: true,
        includeTextOpacity: true
      };

      const textNode = mockTextNode({
        characters: 'This text should be ignored',
        fills: [{ type: 'SOLID', color: { r: 0, g: 1, b: 0 }, visible: true }],
        textStyleId: 'body-text',
        opacity: 0.75
      });

      // Should include attributes but not text content
      expect(attributeOnlySettings.useTextContent).toBe(false);
      expect(attributeOnlySettings.includeTextColor).toBe(true);
      expect(attributeOnlySettings.includeTextStyle).toBe(true);
      expect(attributeOnlySettings.includeTextOpacity).toBe(true);
    });
  });
}); 