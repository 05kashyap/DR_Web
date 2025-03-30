export const preprocessImage = async (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas for resizing to 299x299
      const canvas = document.createElement('canvas');
      canvas.width = 299;
      canvas.height = 299;
      const ctx = canvas.getContext('2d');
      
      // Draw and resize image to canvas
      ctx.drawImage(img, 0, 0, 299, 299);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, 299, 299).data;
      
      // Create tensor array (1, 3, 299, 299) - batch, channels, height, width
      const tensorData = new Float32Array(1 * 3 * 299 * 299);
      
      // Convert to CHW format and normalize with mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]
      for (let y = 0; y < 299; y++) {
        for (let x = 0; x < 299; x++) {
          const pixelOffset = (y * 299 + x) * 4;
          
          // Apply normalization: (value / 255 - mean) / std
          // With mean=0.5 and std=0.5, this simplifies to (value / 255 - 0.5) / 0.5 = value / 127.5 - 1
          tensorData[0 * 299 * 299 + y * 299 + x] = (imageData[pixelOffset] / 127.5) - 1;     // R
          tensorData[1 * 299 * 299 + y * 299 + x] = (imageData[pixelOffset + 1] / 127.5) - 1; // G
          tensorData[2 * 299 * 299 + y * 299 + x] = (imageData[pixelOffset + 2] / 127.5) - 1; // B
        }
      }
      
      resolve(tensorData);
    };
    
    img.onerror = (error) => {
      reject(error);
    };
    
    img.src = URL.createObjectURL(file);
  });
};