import { sizeAdaptivity, sizeX, sizeY, isLight } from './responsive';

function mockDimensions(width: number, height: number) {
  const mockFn = (key: string) => {
    if (key === 'screen') {
      return { width, height };
    }
    if (key === 'window') {
      return { width, height, scale: 2, fontScale: 1 };
    }
    return {} as unknown;
  };
  jest.spyOn(require('react-native').Dimensions, 'get').mockImplementation(mockFn as any);
}

describe('responsive', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sizeX', () => {
    it('scales linearly from iPhone 11 baseline', () => {
      mockDimensions(375, 812);
      expect(sizeX(100)).toBe(100);
    });

    it('scales up toward iPhone 15 Pro Max', () => {
      mockDimensions(430, 932);
      expect(sizeX(100)).toBeGreaterThan(100);
    });

    it('clamps at 0.9 for very small screens', () => {
      mockDimensions(300, 600);
      expect(sizeX(100)).toBeLessThanOrEqual(90);
    });

    it('clamps at 1.3 for very large screens', () => {
      mockDimensions(500, 1000);
      expect(sizeX(100)).toBeLessThanOrEqual(130);
    });
  });

  describe('sizeY', () => {
    it('scales linearly from iPhone 11 baseline', () => {
      mockDimensions(375, 812);
      expect(sizeY(100)).toBe(100);
    });

    it('scales up toward iPhone 15 Pro Max', () => {
      mockDimensions(430, 932);
      expect(sizeY(100)).toBeGreaterThan(100);
    });
  });

  describe('sizeAdaptivity', () => {
    it('returns the input unchanged at iPhone 13 baseline', () => {
      mockDimensions(390, 844);
      expect(sizeAdaptivity(16)).toBe(16);
    });

    it('scales down for smaller screens', () => {
      mockDimensions(320, 568);
      expect(sizeAdaptivity(16)).toBeLessThan(16);
    });

    it('scales up for larger screens', () => {
      mockDimensions(430, 932);
      expect(sizeAdaptivity(16)).toBeGreaterThan(16);
    });

    it('clamps to [0.9, 1.3] of the input', () => {
      mockDimensions(200, 300);
      expect(sizeAdaptivity(100)).toBeLessThanOrEqual(90);
      mockDimensions(600, 1200);
      expect(sizeAdaptivity(100)).toBeLessThanOrEqual(130);
    });
  });

  describe('isLight', () => {
    it('returns true for white', () => {
      expect(isLight('#FFFFFF')).toBe(true);
    });

    it('returns false for black', () => {
      expect(isLight('#000000')).toBe(false);
    });

    it('accepts a custom threshold', () => {
      // #808080 has luminance 128
      expect(isLight('#808080', 100)).toBe(true);
      expect(isLight('#808080', 150)).toBe(false);
    });
  });
});
