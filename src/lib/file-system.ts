import { save, open } from '@tauri-apps/api/dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/api/fs';

export async function openSvgFile() {
  try {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'SVG',
        extensions: ['svg']
      }]
    });

    if (!selected) return null;

    const content = await readTextFile(selected as string);
    return { path: selected, content };
  } catch (error) {
    console.error('Error opening file:', error);
    return null;
  }
}

export async function saveSvgFile(content: string, defaultPath?: string) {
  try {
    const savePath = await save({
      defaultPath,
      filters: [{
        name: 'SVG',
        extensions: ['svg']
      }]
    });

    if (savePath) {
      await writeTextFile(savePath, content);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving file:', error);
    return false;
  }
}

export async function exportSvgFile(svgCode: string, format: 'svg' | 'png' | 'jpg'): Promise<boolean> {
  try {
    const options = {
      filters: [{
        name: format.toUpperCase(),
        extensions: [format]
      }]
    };
    
    const filePath = await save(options);
    
    if (!filePath) return false;

    if (format === 'svg') {
      // Direct SVG save
      await writeTextFile(filePath, svgCode);
    } else {
      // For PNG and JPG, you'll need to convert the SVG first
      // This might require additional processing using a library or native capabilities
      const blob = await convertSvgToImage(svgCode, format);
      await writeBinaryFile(filePath, blob);
    }

    return true;
  } catch (error) {
    console.error('Error exporting file:', error);
    throw error;
  }
}

// Helper function to convert SVG to image formats
async function convertSvgToImage(svgCode: string, format: 'png' | 'jpg'): Promise<Uint8Array> {
  // You'll need to implement the conversion logic here
  // This might involve:
  // 1. Creating a temporary SVG element
  // 2. Converting it to a canvas
  // 3. Exporting the canvas to the desired format
  // 4. Converting the result to a Uint8Array
  
  // This is a placeholder - you'll need to implement the actual conversion
  throw new Error('Image conversion not implemented yet');
}