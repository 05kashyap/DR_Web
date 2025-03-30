// src/components/DRDetector.js
import React, { useState, useEffect, useRef } from 'react';
import * as ort from 'onnxruntime-web';
import { preprocessImage } from '../utils/imageProcessor'; // Assuming this path is correct
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiRefreshCw, FiEye, FiEyeOff, FiAlertTriangle, FiCheckCircle, FiLoader, FiInfo } from 'react-icons/fi'; // Added FiImage

// Helper function (Keep as is)
const interpretResults = (outputData) => {
    // ... (your existing interpretResults function)
    const logits = Array.from(outputData);
    const maxLogit = Math.max(...logits);
    const expValues = logits.map(x => Math.exp(x - maxLogit));
    const sumExp = expValues.reduce((a, b) => a + b, 0);
    const probabilities = expValues.map(x => x / sumExp);
  
    const drProbability = probabilities[0]; 
    const prediction = drProbability > 0.5 ? "Diabetic Retinopathy Detected" : "No Diabetic Retinopathy";
  
    return { prediction, probability: drProbability };
};

// Animation variants (Keep as is)
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};


const DRDetector = () => {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState(null);
    const [isModelReady, setIsModelReady] = useState(false);
    const [isResultVisible, setIsResultVisible] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize ONNX model (Keep as is)
    useEffect(() => {
        const initONNX = async () => {
            try {
                const model = await ort.InferenceSession.create('/models/Xception_Multilevel_epochs_70.onnx');
                setSession(model);
                setIsModelReady(true);
                setError(null);
            } catch (e) {
                console.error("Failed to initialize ONNX model:", e);
                setError("Failed to load the AI model. Please refresh the page or try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        initONNX();
    }, []);

    // Process Image (Keep as is)
    const processImage = async (file) => {
        if (!session || !file) return;
        setSelectedImage(URL.createObjectURL(file));
        setResult(null);
        setIsResultVisible(false);
        setError(null);
        setIsProcessing(true);
        try {
            const tensorData = await preprocessImage(file);
            const tensor = new ort.Tensor('float32', tensorData, [1, 3, 299, 299]);
            const feeds = { input: tensor };
            const results = await session.run(feeds);
            const outputData = results.output?.data;
            if (!outputData) {
                throw new Error("Model output format unexpected.");
            }
            setResult(interpretResults(outputData));
        } catch (e) {
            console.error("Inference failed:", e);
            setError(`Failed to analyze image: ${e.message}. Try a different image or check console.`);
            setSelectedImage(null);
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle File Change (Keep as is, including validation)
     const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setError("Invalid file type. Please upload JPG, JPEG, or PNG images.");
                // Clear the invalid file from selection visually
                if(fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError("File is too large. Please upload images under 10MB.");
                if(fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            setError(null); // Clear previous errors on valid selection
            processImage(file);
        }
        // Still necessary if the user cancels the file dialog after selecting a file previously
        // or to allow re-selection of the *same* file name.
        // Although processImage clears state, this ensures the input itself is reset.
        // Commenting out if it causes issues, but generally useful.
        // if(fileInputRef.current) {
        //     fileInputRef.current.value = '';
        // }
    };


    // Reset Analysis (Keep as is)
    const resetAnalysis = () => {
        setResult(null);
        setSelectedImage(null);
        setIsResultVisible(false);
        setError(null);
        setIsProcessing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Get Prediction Class (Keep as is)
    const getPredictionClass = (base = "text") => {
        // ... (no changes needed)
        if (!result) return `${base}-gray-700`;
        return result.prediction.includes("Detected") ? `${base}-red-600` : `${base}-green-600`;
    };

    return (
        <motion.div
            className="max-w-6xl mx-auto p-6 md:p-10 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 rounded-2xl shadow-xl min-h-[80vh]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header Section (Keep as is) */}
            <div className="text-center mb-10">
                 <motion.div
                    className="bg-white px-6 py-5 rounded-xl shadow-md"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                 >
                    <h1 className="text-xl font-bold text-indigo-900 tracking-tight">DEPARTMENT OF INFORMATION TECHNOLOGY</h1>
                    <h2 className="text-lg font-semibold text-indigo-800 mt-1">NATIONAL INSTITUTE OF TECHNOLOGY, KARNATAKA</h2>
                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
                    <h3 className="text-md text-indigo-700">DEEP LEARNING (IT353) COURSE PROJECT</h3>
                    <h3 className="text-lg font-bold text-indigo-800 mt-2">DIABETIC RETINOPATHY DETECTION</h3>
                    <p className="text-xs mt-2 text-indigo-600 font-medium">SUBMITTED BY: ARYAN KASHYAP (221AI012), DEEPAK C NAYAK (221AI016)</p>
                    <p className="text-xs mt-1 text-indigo-600 font-medium">Session: January - April 2025</p>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Panel - Upload & Preview */}
                <motion.div
                    className="bg-white p-6 rounded-xl shadow-lg flex flex-col"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    {/* --- Simplified Upload Section Title --- */}
                    <h3 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-2 border-gray-200">
                        Upload Retinal Image
                    </h3>

                    {/* --- Simplified File Input Area --- */}
                    <div className="mb-6 flex-grow flex flex-col justify-center">
                        <div className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition-colors duration-300 rounded-lg p-8 text-center bg-indigo-50/50">
                            {/* Hidden actual file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png,image/jpg"
                                style={{ display: 'none' }}
                                disabled={!isModelReady || isProcessing}
                            />
                            {/* Styled Button acting as the primary interaction point */}
                            <motion.button
                                onClick={() => fileInputRef.current.click()}
                                disabled={!isModelReady || isProcessing}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-lg" // Increased text size slightly
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiUpload className="mr-2" /> {/* Icon inside button */}
                                {isProcessing ? "Processing..." : (selectedImage ? "Change Image" : "Choose Image")}
                            </motion.button>
                            {/* Support text less prominent */}
                            <p className="text-xs text-gray-500 mt-4">Supports: JPG, JPEG, PNG (Max 10MB)</p>
                        </div>
                    </div>

                    {/* Status Messages Area - Reduced Clutter */}
                    <div className="h-16 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {/* Initial Model Loading */}
                            {isLoading && (
                                <motion.div key="loading" {...fadeInUp} className="flex items-center justify-center text-indigo-600">
                                    <FiLoader className="animate-spin mr-2 text-xl" />
                                    <p>Loading AI Model...</p>
                                </motion.div>
                            )}
                            {/* Image Processing Loader */}
                            {!isLoading && isProcessing && (
                                <motion.div key="processing" {...fadeInUp} className="flex items-center justify-center text-blue-600">
                                    <FiLoader className="animate-spin mr-2 text-xl" />
                                    <p>Analyzing Image...</p>
                                </motion.div>
                            )}
                            {/* Error Message */}
                            {error && !isProcessing && (
                                <motion.div
                                    key="error"
                                    {...fadeInUp}
                                    className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center text-sm w-full"
                                >
                                    <FiAlertTriangle className="mr-2 text-lg flex-shrink-0" />
                                    <p>{error}</p>
                                </motion.div>
                            )}
                            {/* NOTE: Removed the explicit "Model ready..." message for simplicity */}
                             {!isLoading && !isProcessing && !error && !selectedImage && isModelReady && (
                                 <motion.div key="ready-placeholder" {...fadeInUp} className="text-transparent">
                                     {/* Placeholder to maintain height, visually empty */}
                                     Model Ready...
                                 </motion.div>
                             )}
                        </AnimatePresence>
                    </div>

                    {/* Image Preview & Actions (Keep as is) */}
                    <AnimatePresence>
                        {selectedImage && (
                            <motion.div
                                className="mt-4"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <h4 className="text-md font-medium text-gray-700 mb-2">Preview:</h4>
                                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                                    <img
                                        src={selectedImage}
                                        alt="Selected retinal scan"
                                        className="w-full h-auto object-contain"
                                        style={{ maxHeight: '250px' }}
                                    />
                                </div>
                                <div className="flex justify-between mt-5 space-x-3">
                                    {result && !isResultVisible && (
                                        <motion.button
                                            onClick={() => setIsResultVisible(true)}
                                            className="flex-1 px-5 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isProcessing}
                                        > <FiEye className="mr-2" /> Show Results </motion.button>
                                    )}
                                    {!result && <div className="flex-1"></div>} {/* Maintain layout */}
                                    <motion.button
                                        onClick={resetAnalysis}
                                        className="flex-1 px-5 py-2.5 bg-white border border-red-400 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center justify-center"
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    > <FiRefreshCw className="mr-2" /> Reset </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Right Panel - Results */}
                <motion.div
                    className="bg-white p-6 rounded-xl shadow-lg flex flex-col"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    {/* <h3 className="text-xl font-semibold text-gray-800 mb-5 border-b pb-2 border-gray-200">
                        Analysis Results
                    </h3> */}

                    <div className="flex-grow flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {/* --- RESULTS DISPLAY (when available) --- */}
                            {isResultVisible && result ? (
                                <motion.div
                                    key="results-content"
                                    className="w-full"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {/* Diagnosis Card (Keep as is) */}
                                    <motion.div
                                        className={`p-5 rounded-lg mb-6 border ${result.prediction.includes("Detected") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
                                        initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} >
                                        <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                                            {result.prediction.includes("Detected") ? <FiAlertTriangle className={`mr-2 ${getPredictionClass('text')}`} /> : <FiCheckCircle className={`mr-2 ${getPredictionClass('text')}`} />} Diagnosis: </h4>
                                        <motion.div className={`text-2xl font-bold mb-3 ${getPredictionClass()}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} > {result.prediction} </motion.div>
                                        <div className="mt-4">
                                            <div className="flex justify-between mb-1"> <span className="text-sm font-medium text-gray-700">Probability of DR:</span> <span className={`text-sm font-bold ${getPredictionClass()}`}> {(result.probability * 100).toFixed(1)}% </span> </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                <motion.div className={`h-2.5 rounded-full ${getPredictionClass('bg')}`} initial={{ width: '0%' }} animate={{ width: `${result.probability * 100}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                    {/* Interpretation Card (Keep as is) */}
                                    <motion.div className="p-5 bg-blue-50 rounded-lg border border-blue-200" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                        <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center"><FiInfo className="mr-2 text-blue-600" /> Interpretation:</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed"> {result.prediction.includes("Detected") ? "The analysis detected patterns consistent with diabetic retinopathy." : "The analysis did not detect significant signs."} </p>
                                        <div className="mt-4 p-3 bg-amber-100/70 rounded-md border border-amber-200"> <p className="text-xs text-amber-900"> <span className="font-semibold">Disclaimer:</span> This tool provides only a preliminary screening, not to taken as a substitute for professional medical consultation. </p> </div>
                                    </motion.div>
                                    {/* Hide Button (Keep as is) */}
                                    <div className="mt-6 flex justify-end"> <motion.button onClick={() => setIsResultVisible(false)} className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> <FiEyeOff className="mr-2"/> Hide Results </motion.button> </div>
                                </motion.div>
                            ) : (
                                /* --- SIMPLIFIED Results Placeholder --- */
                                <motion.div
                                    key="results-placeholder"
                                    className="text-center text-gray-500"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    {/* Optional: A subtle icon like FiImage or similar */}
                                    {/* <FiImage className="text-4xl mx-auto mb-4 text-indigo-200" /> */}
                                    <p className="text-md">
                                        {selectedImage ? "Analysis results will appear here." : "Upload an image to begin analysis."}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>


        </motion.div>
    );
};

export default DRDetector;