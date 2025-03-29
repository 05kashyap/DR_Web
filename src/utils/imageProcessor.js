export const preprocessImage = async (imageFile) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const img = new Image();
      
      reader.onload = () => {
        img.onload = () => {
          // Create a canvas element to resize and normalize the image
          const canvas = document.createElement('canvas');
          canvas.width = 299;  // Xception expects 299x299 images
          canvas.height = 299;
          const ctx = canvas.getContext('2d');
          
          // Draw and resize image to 299x299
          ctx.drawImage(img, 0, 0, 299, 299);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, 299, 299).data;
          
          // Prepare tensor data (convert to RGB float32 array and normalize)
          const tensorData = new Float32Array(3 * 299 * 299);
          for (let i = 0; i < imageData.length / 4; i++) {
            // RGBA to RGB and normalize to [0,1]
            tensorData[i] = imageData[i * 4] / 255.0;                   // R
            tensorData[i + 299 * 299] = imageData[i * 4 + 1] / 255.0;   // G
            tensorData[i + 2 * 299 * 299] = imageData[i * 4 + 2] / 255.0; // B
          }
          
          resolve(tensorData);
        };
        img.src = reader.result;
      };
      
      reader.readAsDataURL(imageFile);
    });
  };