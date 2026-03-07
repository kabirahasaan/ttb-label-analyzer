import * as fs from 'fs';
import * as path from 'path';
import { LabelData } from '@ttb/shared-types';

/**
 * Test Label Image Generator
 * Creates realistic test label images with text overlays
 */
export class TestImageGenerator {
  /**
   * Generate a simple label image with text
   * Uses SVG to create a text-based label image
   */
  static async generateLabelImage(label: LabelData, outputPath: string): Promise<string> {
    const { brandName, alcoholByVolume, netContents, governmentWarning, classType, producerName } =
      label;

    // Create an SVG label template
    const svg = `
      <svg width="800" height="1200" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="800" height="1200" fill="#f5f5dc"/>
        
        <!-- Border -->
        <rect x="20" y="20" width="760" height="1160" fill="none" stroke="#8b4513" stroke-width="4"/>
        
        <!-- Brand Name (Large, centered) -->
        <text x="400" y="150" font-family="Georgia, serif" font-size="48" font-weight="bold" 
              text-anchor="middle" fill="#2c1810">
          ${this.escapeXml(brandName)}
        </text>
        
        <!-- Class Type -->
        <text x="400" y="220" font-family="Arial, sans-serif" font-size="24" 
              text-anchor="middle" fill="#5c4033">
          ${this.escapeXml(classType.toUpperCase())}
        </text>
        
        <!-- ABV -->
        <text x="400" y="320" font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
              text-anchor="middle" fill="#2c1810">
          ${alcoholByVolume}% ALC/VOL
        </text>
        
        <!-- Net Contents -->
        <text x="400" y="380" font-family="Arial, sans-serif" font-size="28" 
              text-anchor="middle" fill="#2c1810">
          ${this.escapeXml(netContents)}
        </text>
        
        <!-- Producer -->
        <text x="400" y="500" font-family="Arial, sans-serif" font-size="20" 
              text-anchor="middle" fill="#5c4033">
          Produced by
        </text>
        <text x="400" y="530" font-family="Arial, sans-serif" font-size="22" font-weight="bold" 
              text-anchor="middle" fill="#2c1810">
          ${this.escapeXml(producerName)}
        </text>
        
        <!-- Government Warning (Small text, at bottom) -->
        <foreignObject x="60" y="900" width="680" height="260">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 12px; color: #2c1810; border: 1px solid #8b4513; padding: 10px; background: white;">
            ${this.escapeXml(governmentWarning)}
          </div>
        </foreignObject>
      </svg>
    `.trim();

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write SVG file
    fs.writeFileSync(outputPath, svg);

    return outputPath;
  }

  /**
   * Generate batch of label images
   */
  static async generateBatch(labels: LabelData[], outputDir: string): Promise<string[]> {
    const paths: string[] = [];

    for (const label of labels) {
      const slug = this.slugify(label.brandName);
      const outputPath = path.join(outputDir, `${slug}.svg`);
      await this.generateLabelImage(label, outputPath);
      paths.push(outputPath);
    }

    return paths;
  }

  /**
   * Escape XML special characters
   */
  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Convert string to slug for file names
   */
  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
