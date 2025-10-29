/**
 * ResponsiveHelper.ts
 * Utility for responsive UI scaling and device detection
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  width: number;
  height: number;
  scaleFactor: number;
}

export class ResponsiveHelper {
  /**
   * Get current device information based on screen size
   */
  static getDeviceInfo(width: number, height: number): DeviceInfo {
    const isPortrait = height > width;
    const isLandscape = !isPortrait;
    
    // Device classification based on width
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    
    // Calculate scale factor (base: 1280x720)
    const baseWidth = 1280;
    const baseHeight = 720;
    const scaleX = width / baseWidth;
    const scaleY = height / baseHeight;
    const scaleFactor = Math.min(scaleX, scaleY);
    
    return {
      isMobile,
      isTablet,
      isDesktop,
      isPortrait,
      isLandscape,
      width,
      height,
      scaleFactor
    };
  }

  /**
   * Get responsive font size based on device
   */
  static getFontSize(
    mobileSize: number,
    tabletSize: number,
    desktopSize: number,
    device: DeviceInfo
  ): number {
    if (device.isMobile) return mobileSize;
    if (device.isTablet) return tabletSize;
    return desktopSize;
  }

  /**
   * Get responsive button dimensions
   */
  static getButtonSize(device: DeviceInfo): { width: number; height: number; fontSize: number } {
    if (device.isMobile) {
      return {
        width: Math.min(device.width * 0.8, 300),
        height: 50,
        fontSize: 18
      };
    }
    if (device.isTablet) {
      return {
        width: 350,
        height: 55,
        fontSize: 22
      };
    }
    return {
      width: 400,
      height: 60,
      fontSize: 24
    };
  }

  /**
   * Get responsive spacing
   */
  static getSpacing(baseSpacing: number, device: DeviceInfo): number {
    return baseSpacing * device.scaleFactor;
  }

  /**
   * Get safe area for UI elements (accounts for notches, etc)
   */
  static getSafeArea(device: DeviceInfo): {
    top: number;
    bottom: number;
    left: number;
    right: number;
  } {
    const topMargin = device.isMobile ? 50 : 30;
    const bottomMargin = device.isMobile ? 80 : 40;
    const sideMargin = device.isMobile ? 20 : 40;
    
    return {
      top: topMargin,
      bottom: bottomMargin,
      left: sideMargin,
      right: sideMargin
    };
  }

  /**
   * Get HUD position and size
   */
  static getHUDLayout(device: DeviceInfo): {
    fontSize: number;
    padding: number;
    iconSize: number;
    spacing: number;
  } {
    if (device.isMobile) {
      return {
        fontSize: 14,
        padding: 8,
        iconSize: 24,
        spacing: 10
      };
    }
    if (device.isTablet) {
      return {
        fontSize: 16,
        padding: 12,
        iconSize: 28,
        spacing: 12
      };
    }
    return {
      fontSize: 20,
      padding: 16,
      iconSize: 32,
      spacing: 15
    };
  }

  /**
   * Check if touch controls should be shown
   */
  static shouldShowTouchControls(device: DeviceInfo): boolean {
    // Show touch controls on mobile and tablet portrait
    return device.isMobile || (device.isTablet && device.isPortrait);
  }

  /**
   * Get touch control button size
   */
  static getTouchButtonSize(device: DeviceInfo): number {
    if (device.isMobile) {
      return device.isPortrait ? 70 : 60;
    }
    return 80;
  }

  /**
   * Get responsive sprite scale
   */
  static getSpriteScale(
    baseScale: number,
    device: DeviceInfo,
    minScale = 0.5,
    maxScale = 1.5
  ): number {
    const scale = baseScale * device.scaleFactor;
    return Math.max(minScale, Math.min(maxScale, scale));
  }

  /**
   * Get centered X position
   */
  static getCenterX(device: DeviceInfo): number {
    return device.width / 2;
  }

  /**
   * Get centered Y position
   */
  static getCenterY(device: DeviceInfo): number {
    return device.height / 2;
  }

  /**
   * Get responsive title size
   */
  static getTitleSize(device: DeviceInfo): number {
    if (device.isMobile) {
      return device.isPortrait ? 40 : 48;
    }
    if (device.isTablet) {
      return 56;
    }
    return 72;
  }

  /**
   * Get responsive subtitle size
   */
  static getSubtitleSize(device: DeviceInfo): number {
    if (device.isMobile) {
      return device.isPortrait ? 16 : 18;
    }
    if (device.isTablet) {
      return 20;
    }
    return 24;
  }

  /**
   * Get vertical layout spacing for buttons
   */
  static getButtonSpacing(device: DeviceInfo, buttonCount: number): {
    startY: number;
    spacing: number;
  } {
    const safeArea = this.getSafeArea(device);
    const availableHeight = device.height - safeArea.top - safeArea.bottom;
    const buttonSize = this.getButtonSize(device);
    
    // Calculate total height needed for all buttons
    const totalButtonHeight = buttonCount * buttonSize.height;
    const spacing = (availableHeight - totalButtonHeight) / (buttonCount + 1);
    
    // Clamp spacing
    const minSpacing = device.isMobile ? 15 : 20;
    const maxSpacing = device.isMobile ? 30 : 50;
    const finalSpacing = Math.max(minSpacing, Math.min(maxSpacing, spacing));
    
    const startY = safeArea.top + finalSpacing;
    
    return { startY, spacing: finalSpacing };
  }
}
