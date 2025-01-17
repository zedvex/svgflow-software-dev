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

export async function exportSvgFile(content: string, defaultPath?: string) {
  try {
    const savePath = await save({
      defaultPath,
      filters: [{
        name: 'SVG',
        extensions: ['svg']
      }, {
        name: 'PNG',
        extensions: ['png']
      }]
    });

    if (!savePath) return false;

    if (savePath.endsWith('.png')) {
      // Convert SVG to PNG
      const svgBlob = new Blob([content], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      
      // Write the PNG file
      await writeTextFile(savePath, base64Data, { encoding: 'base64' });
      URL.revokeObjectURL(url);
    } else {
      // Save as SVG
      await writeTextFile(savePath, content);
    }
    
    return true;
  } catch (error) {
    console.error('Error exporting file:', error);
    return false;
  }
}