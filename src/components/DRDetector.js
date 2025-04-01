// src/components/DRDetector.js
import React, { useState, useRef } from 'react';
// REMOVED: import * as ort from 'onnxruntime-web';
// REMOVED: import { preprocessImage } from '../utils/imageProcessor';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiRefreshCw, FiEye, FiEyeOff, FiAlertTriangle, FiCheckCircle, FiLoader, FiInfo } from 'react-icons/fi';

// --- Configuration ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;

// --- **IMPORTANT: Class Index Mapping** ---
// Adjust these values if your backend model maps classes differently!
// Check your model training labels to confirm which index means what.
const CLASS_INDEX_DR_DETECTED = 0;
// --- End of Class Index Mapping ---


// --- Helper function to interpret BACKEND results ---
const interpretBackendResponse = (data) => {
    // data format from backend: { class: 0 or 1, probabilities: [prob_class_0, prob_class_1] }

    const predictedClass = data.class; // The index the model predicted (0 or 1)
    const probabilities = data.probabilities; // Array of probabilities [prob for index 0, prob for index 1]

    // Determine the human-readable prediction based on the *explicit mapping*
    const isDetected = predictedClass === CLASS_INDEX_DR_DETECTED;
    const prediction = isDetected ? "Diabetic Retinopathy Detected" : "No Diabetic Retinopathy";

    // Get the probability *specifically for the DR_DETECTED class*, regardless of the prediction
    // This ensures the probability bar/percentage always shows the likelihood *of* DR.
    const drProbability = probabilities[CLASS_INDEX_DR_DETECTED] || 0; // Use probability for the DR class index

    return { prediction, probability: drProbability };
};


// Animation variants (Keep as is)
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};


const DRDetector = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [error, setError] = useState(null);
    const [isResultVisible, setIsResultVisible] = useState(false);
    const fileInputRef = useRef(null);

    // --- Process Image by calling the Backend API ---
    const processImage = async (file) => {
        if (!file) return;
        setSelectedImage(URL.createObjectURL(file));
        setResult(null);
        setIsResultVisible(false);
        setError(null);
        setIsProcessing(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(PREDICT_ENDPOINT, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); }
                catch (parseError) { errorData = { error: `Server error: ${response.status} ${response.statusText}` }; }
                throw new Error(errorData?.error || `HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setResult(interpretBackendResponse(data)); // Use the updated interpreter
        } catch (e) {
            console.error("API call failed:", e);
            setError(`Failed to analyze image: ${e.message}. Check connection or try again.`);
            setSelectedImage(null);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Handle File Change (No changes needed here) ---
     const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                setError("Invalid file type. Please upload JPG, JPEG, or PNG images.");
                if(fileInputRef.current) fileInputRef.current.value = ''; return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError("File is too large. Please upload images under 10MB.");
                if(fileInputRef.current) fileInputRef.current.value = ''; return;
            }
            setError(null);
            processImage(file);
        }
        // if(fileInputRef.current) { fileInputRef.current.value = ''; }
    };


    // Reset Analysis (Keep as is)
    const resetAnalysis = () => {
        setResult(null); setSelectedImage(null); setIsResultVisible(false);
        setError(null); setIsProcessing(false);
        if (fileInputRef.current) { fileInputRef.current.value = ''; }
    };

    // Get Prediction Class (No changes needed, relies on result.prediction string)
    const getPredictionClass = (base = "text") => {
        if (!result) return `${base}-gray-700`;
        return result.prediction.includes("Detected") ? `${base}-red-600` : `${base}-green-600`;
    };

    // ==================================================================
    // ======================== JSX Structure ===========================
    // ==================================================================

    return (
        <motion.div
            className="max-w-6xl mx-auto p-6 md:p-10 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 rounded-2xl shadow-xl min-h-[80vh]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-center mb-10">
    <motion.div
        className="bg-white px-8 py-6 rounded-2xl shadow-lg font-serif"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
    >
        <h1 className="text-2xl font-bold text-indigo-900 tracking-wide">
            DEPARTMENT OF INFORMATION TECHNOLOGY
        </h1>
        <h1 className="text-xl font-semibold text-indigo-800 mt-2">
            NATIONAL INSTITUTE OF TECHNOLOGY KARNATAKA, SURATHKAL
        </h1>
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
        <h2 className="text-lg text-indigo-700 font-medium">
            DEEP LEARNING (IT353) COURSE PROJECT
        </h2>
        <h2 className="text-xl font-bold text-indigo-800 mt-3">
            DIABETIC RETINOPATHY DETECTION USING MULTI-LEVEL FINETUNED XCEPTION MODEL
        </h2>
        <h3 className="text-sm mt-3 text-indigo-600 font-medium">
            CARRIED OUT BY: ARYAN KASHYAP (221AI012), DEEPAK C NAYAK (221AI016)
        </h3>
        <h3 className="text-sm mt-1 text-indigo-600 font-medium">
            Session: January - April 2025
        </h3>
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
                    {/* --- Upload Section Title --- */}
                    <p className="text-xl font-semibold text-gray-800 mb-5 border-b pb-2 border-gray-200">
                        Upload Retinal Image
                    </p>

                    {/* --- File Input Area --- */}
                    <div className="mb-6 flex-grow flex flex-col justify-center">
                        <div className="border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition-colors duration-300 rounded-lg p-8 text-center bg-indigo-50/50">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/jpeg,image/png,image/jpg"
                                style={{ display: 'none' }}
                                disabled={isProcessing} // Only disable when processing
                            />
                            <motion.button
                                onClick={() => fileInputRef.current.click()}
                                disabled={isProcessing}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-lg"
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            >
                                <FiUpload className="mr-2" />
                                {isProcessing ? "Processing..." : (selectedImage ? "Change Image" : "Choose Image")}
                            </motion.button>
                            <p className="text-xs text-gray-500 mt-4">Supports: JPG, JPEG, PNG (Max 10MB)</p>
                        </div>
                    </div>

                    {/* Status Messages Area */}
                    <div className="h-16 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {/* Image Processing Loader */}
                            {isProcessing && (
                                <motion.div key="processing" {...fadeInUp} className="flex items-center justify-center text-blue-600">
                                    <FiLoader className="animate-spin mr-2 text-xl" /> <p>Analyzing Image...</p>
                                </motion.div>
                            )}
                            {/* Error Message */}
                            {error && !isProcessing && (
                                <motion.div key="error" {...fadeInUp} className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center text-sm w-full">
                                    <FiAlertTriangle className="mr-2 text-lg flex-shrink-0" /> <p>{error}</p>
                                </motion.div>
                            )}
                            {/* Placeholder when idle */}
                             {!isProcessing && !error && !selectedImage && (
                                 <motion.div key="idle-placeholder" {...fadeInUp} className="text-gray-400 text-sm">
                                     Ready to analyze...
                                 </motion.div>
                             )}
                        </AnimatePresence>
                    </div>

                    {/* Image Preview & Actions */}
                    <AnimatePresence>
                        {selectedImage && (
                            <motion.div
                                className="mt-4"
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }}
                            >
                                <h4 className="text-md font-medium text-gray-700 mb-2">Preview:</h4>
                                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                                    <img src={selectedImage} alt="Selected retinal scan" className="w-full h-auto object-contain" style={{ maxHeight: '250px' }} />
                                </div>
                                <div className="flex justify-between mt-5 space-x-3">
                                    {result && !isResultVisible && (
                                        <motion.button onClick={() => setIsResultVisible(true)} className="flex-1 px-5 py-2.5 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-lg shadow hover:from-green-600 hover:to-teal-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isProcessing} >
                                            <FiEye className="mr-2" /> Show Results
                                        </motion.button>
                                    )}
                                    {/* Maintain layout */}
                                    {(!result || isResultVisible) && <div className="flex-1"></div>}
                                    <motion.button onClick={resetAnalysis} className="flex-1 px-5 py-2.5 bg-white border border-red-400 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center justify-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={isProcessing} >
                                        <FiRefreshCw className="mr-2" /> Reset
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Right Panel - Results */}
                <motion.div
                    className="bg-white p-6 rounded-xl shadow-lg flex flex-col"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div className="flex-grow flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {/* --- RESULTS DISPLAY --- */}
                            {isResultVisible && result ? (
                                <motion.div key="results-content" className="w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5 }} >
                                    {/* Diagnosis Card (Now uses correct interpretation) */}
                                    <motion.div className={`p-5 rounded-lg mb-6 border ${result.prediction.includes("Detected") ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`} initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} >
                                        <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                                            {result.prediction.includes("Detected") ? <FiAlertTriangle className={`mr-2 ${getPredictionClass('text')}`} /> : <FiCheckCircle className={`mr-2 ${getPredictionClass('text')}`} />} Diagnosis: </h4>
                                        <motion.div className={`text-2xl font-bold mb-3 ${getPredictionClass()}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} > {result.prediction} </motion.div>
                                        <div className="mt-4">
                                            {/* Probability display now correctly shows P(DR Detected) */}
                                            <div className="flex justify-between mb-1"> <span className="text-sm font-medium text-gray-700">Probability of DR:</span> <span className={`text-sm font-bold ${getPredictionClass()}`}> {(result.probability * 100).toFixed(1)}% </span> </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                                <motion.div className={`h-2.5 rounded-full ${getPredictionClass('bg')}`} initial={{ width: '0%' }} animate={{ width: `${result.probability * 100}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                    {/* Interpretation Card */}
                                    <motion.div className="p-5 bg-blue-50 rounded-lg border border-blue-200" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                                        <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-center"><FiInfo className="mr-2 text-blue-600" /> Interpretation:</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed"> {result.prediction.includes("Detected") ? "The analysis detected patterns consistent with diabetic retinopathy based on the trained model." : "The analysis did not detect significant signs of diabetic retinopathy based on the trained model."} </p>
                                        <div className="mt-4 p-3 bg-amber-100/70 rounded-md border border-amber-200"> <p className="text-xs text-amber-900"> <span className="font-semibold">Disclaimer:</span> This tool provides only a preliminary screening based on an AI model and is not a substitute for professional medical diagnosis or consultation. Always consult a qualified healthcare provider. </p> </div>
                                    </motion.div>
                                    {/* Hide Button */}
                                    <div className="mt-6 flex justify-end"> <motion.button onClick={() => setIsResultVisible(false)} className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}> <FiEyeOff className="mr-2"/> Hide Results </motion.button> </div>
                                </motion.div>
                            ) : (
                                /* --- Results Placeholder --- */
                                <motion.div key="results-placeholder" className="text-center text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} >
                                    <p className="text-md"> {selectedImage ? "Click 'Show Results' after analysis." : "Upload an image to begin analysis."} </p>
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