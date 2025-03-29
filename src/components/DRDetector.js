import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import * as ort from 'onnxruntime-web';
import { preprocessImage } from '../utils/imageProcessor';

const DRDetector = () => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  // Initialize ONNX Runtime session
  useEffect(() => {
    const initONNX = async () => {
      try {
        setIsLoading(true);
        const model = await ort.InferenceSession.create('/models/Xception_Multilevel_epochs_70.onnx');
        setSession(model);
        setIsLoading(false);
      } catch (e) {
        console.error("Failed to initialize ONNX model:", e);
        setError("Failed to load the model. Please try again later.");
        setIsLoading(false);
      }
    };
    
    initONNX();
  }, []);

  // Handle file upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setSelectedImage(URL.createObjectURL(file));
        
        if (session) {
          try {
            setIsLoading(true);
            setResult(null);
            
            // Preprocess image
            const tensorData = await preprocessImage(file);
            
            // Run inference
            const tensor = new ort.Tensor('float32', tensorData, [1, 3, 299, 299]);
            const feeds = { input: tensor };
            const results = await session.run(feeds);
            
            // Get output
            const outputData = results.output.data;
            
            // Interpret results (softmax calculation for probabilities)
            const exp0 = Math.exp(outputData[0]);
            const exp1 = Math.exp(outputData[1]);
            const sum = exp0 + exp1;
            const probability = exp1 / sum; // Probability of class 1 (Diabetic Retinopathy)
            
            setResult({
              prediction: probability > 0.5 ? "Diabetic Retinopathy Detected" : "No Diabetic Retinopathy",
              probability: probability
            });
            
            setIsLoading(false);
          } catch (e) {
            console.error("Inference failed:", e);
            setError("Failed to analyze the image. Please try another image.");
            setIsLoading(false);
          }
        }
      }
    }
  });

  return (
    <div className="dr-detector">
      <h1>Diabetic Retinopathy Detection</h1>
      
      {isLoading && <p>Loading... Please wait.</p>}
      {error && <p className="error">{error}</p>}
      
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & drop a retinal image here, or click to select one</p>
      </div>
      
      {selectedImage && (
        <div className="preview">
          <h3>Selected Image:</h3>
          <img src={selectedImage} alt="Selected retinal scan" />
        </div>
      )}
      
      {result && (
        <div className="results">
          <h3>Analysis Results:</h3>
          <p className={result.prediction.includes("Detected") ? "positive" : "negative"}>
            {result.prediction}
          </p>
          <p>Confidence: {(result.probability * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default DRDetector;