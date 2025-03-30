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
  const [isResultVisible, setIsResultVisible] = useState(false);

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
        setResult(null);
        setIsResultVisible(false);
        
        if (session) {
          try {
            setIsLoading(true);
            const tensorData = await preprocessImage(file);
            const tensor = new ort.Tensor('float32', tensorData, [1, 3, 299, 299]);
            const feeds = { input: tensor };
            const results = await session.run(feeds);
            
            const outputData = results.output.data;
            const exp0 = Math.exp(outputData[0]);
            const exp1 = Math.exp(outputData[1]);
            const sum = exp0 + exp1;
            const probability = exp1 / sum;
            
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
      <h1>NATIONAL INSTITUTE OF TECHNOLOGY, KARNATAKA</h1>
      <h2>DEPARTMENT OF INFORMATION TECHNOLOGY</h2>
      <h3>DEEP LEARNING (IT353) COURSE PROJECT (ACADEMIC YEAR 2024-25):</h3>
      <h3>DIABETIC RETINOPATHY DETECTION USING MULTILEVEL FINE-TUNED XCEPTION MODEL</h3>
      <p><b>SUBMITTED BY: ARYAN KASHYAP (221AI012), DEEPAK C NAYAK (221AI016)</b></p>

      {isLoading && <p>Loading... Please wait.</p>}
      {error && <p className="error">{error}</p>}
      
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <button>Upload Retinal Image</button>
      </div>
      
      {selectedImage && (
        <div className="preview">
          <h3>Selected Image:</h3>
          <img src={selectedImage} alt="Selected retinal scan" />
          <button onClick={() => setIsResultVisible(true)}>Show Results</button>
        </div>
      )}
      
      {isResultVisible && result && (
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
