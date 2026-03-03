"use client";

import React, { useState, useRef } from 'react';
import { removeBackground as imglyRemoveBackground, Config } from "@imgly/background-removal";
import { UploadCloud, Image as ImageIcon, Download, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOriginalFile(file);
      setProcessedImage(null);
      setError(null);
      setProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file.");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setOriginalFile(file);
      setProcessedImage(null);
      setError(null);
      setProgress(0);
    }
  };

  const removeBackground = async () => {
    if (!selectedImage || !originalFile) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Define configuration for @imgly/background-removal
      const config: Config = {
        progress: (key, current, total) => {
          // Provide rough progress updates based on fetching models and chunks
          const rawProgress = Math.round((current / total) * 100);
          setProgress(rawProgress > 100 ? 100 : rawProgress);
        },
      };

      const resultBlob = await imglyRemoveBackground(selectedImage, config);
      const outputUrl = URL.createObjectURL(resultBlob);

      setProcessedImage(outputUrl);
    } catch (err) {
      console.error("Error removing background:", err);
      setError("Failed to process the image. Your device might not support WebGL or ran out of memory.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setOriginalFile(null);
    setProcessedImage(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-[#0f1015] text-white flex flex-col items-center justify-center p-6 sm:p-12 font-sans selection:bg-purple-500/30">
      <div className="max-w-4xl w-full mx-auto space-y-12">

        {/* Header section */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            100% Client-Side Processing
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight"
          >
            Remove backgrounds <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              in seconds.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-lg mx-auto text-lg"
          >
            Instantly remove backgrounds from your images for free directly in your browser. No data ever leaves your device.
          </motion.p>
        </div>

        {/* Main Interface */}
        <div className="bg-[#161821] border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden relative">

          {/* decorative gradient orb */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {!selectedImage ? (
              // Empty State - Upload Area
              <motion.div
                key="upload-area"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/10 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer min-h-[400px]"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <UploadCloud className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Click to upload or drag & drop</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs text-center">
                  Supports high-resolution PNG, JPG, and WEBP formats.
                </p>
                <button className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  Select an image
                </button>
              </motion.div>
            ) : (
              // Processing & Result Area
              <motion.div
                key="result-area"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">

                  {/* Original Image */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Original Image
                      </span>
                    </div>
                    <div className="relative aspect-square sm:aspect-video md:aspect-square bg-black/40 rounded-2xl overflow-hidden border border-white/5 group">
                      <img src={selectedImage} alt="Original" className="w-full h-full object-contain" />
                    </div>
                  </div>

                  {/* Processing Arrow/Indicator (Desktop) */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#161821] border border-white/10 rounded-full items-center justify-center shadow-xl">
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  {/* Processed Result */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm font-medium text-purple-400 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Transparent Layout
                      </span>
                    </div>
                    <div className="relative aspect-square sm:aspect-video md:aspect-square bg-[url('https://raw.githubusercontent.com/imgly/background-removal-js/main/packages/demo/public/checkerboard.png')] rounded-2xl overflow-hidden border border-white/5 bg-repeat bg-[length:20px_20px]">
                      {processedImage ? (
                        <motion.img
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          src={processedImage}
                          alt="Processed"
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                          {!isProcessing ? (
                            <p className="text-gray-400 text-sm">Ready to isolate...</p>
                          ) : (
                            <div className="flex flex-col items-center space-y-4">
                              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                              <div className="text-center">
                                <p className="text-sm font-medium text-white mb-1">AI Processing Image</p>
                                <p className="text-xs text-purple-400">{progress}% complete</p>
                              </div>
                              <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-purple-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-white/5">
                  <button
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Start Over
                  </button>

                  {!processedImage ? (
                    <button
                      onClick={removeBackground}
                      disabled={isProcessing}
                      className="flex-1 w-full sm:max-w-xs px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold flex items-center justify-center gap-2 rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
                    >
                      {isProcessing ? 'Processing AI...' : 'Remove Background'}
                    </button>
                  ) : (
                    <a
                      href={processedImage}
                      download={`isolated_${originalFile?.name || 'image.png'}`}
                      className="flex-1 w-full sm:max-w-xs px-6 py-3 bg-white text-black font-semibold flex items-center justify-center gap-2 rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                      <Download className="w-5 h-5" /> Download HD Result
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </main>
  );
}
