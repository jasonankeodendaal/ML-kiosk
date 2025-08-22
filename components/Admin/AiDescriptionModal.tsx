import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XIcon } from '../Icons';

interface AiDescriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyDescription: (description: string) => void;
    productName: string;
    brandName: string;
    specifications: { key: string; value: string }[];
}

const MotionDiv = motion.div as any;

const AiDescriptionModal: React.FC<AiDescriptionModalProps> = ({
    isOpen,
    onClose,
    onApplyDescription,
    productName,
    brandName,
    specifications,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            generateDescription();
        }
    }, [isOpen]);

    const generateDescription = async () => {
        if (!productName) {
            setError('Please enter a product name before generating a description.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedDescription('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const specsString = specifications
                .filter(spec => spec.key && spec.value)
                .map(spec => `${spec.key}: ${spec.value}`)
                .join(', ');

            const prompt = `
                Act as a creative marketing copywriter for a premium brand. 
                Write a compelling and professional product description for the following product. 
                Keep it concise, focusing on key features and benefits. Use an engaging and sophisticated tone. Do not use markdown formatting.

                Product Details:
                - Product Name: ${productName}
                - Brand: ${brandName}
                ${specsString ? `- Key Specifications: ${specsString}` : ''}
            `;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            
            const text = response.text;
            setGeneratedDescription(text);

        } catch (err) {
            console.error('Gemini API error:', err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred while generating the description.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApply = () => {
        onApplyDescription(generatedDescription);
        onClose();
    };


    return (
        <AnimatePresence>
            {isOpen && (
                <MotionDiv
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                >
                    <MotionDiv
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 flex flex-col"
                        onClick={(e: any) => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 section-heading flex items-center gap-2">
                                <SparklesIcon className="h-5 w-5 text-indigo-500" />
                                Generate Product Description
                            </h3>
                            <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                                <XIcon className="h-5 w-5" />
                            </button>
                        </header>

                        <div className="p-6 flex-grow min-h-[300px] flex flex-col">
                            {isLoading && (
                                <div className="flex-grow flex flex-col items-center justify-center text-gray-600 dark:text-gray-300">
                                    <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-500 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <p className="mt-4 text-sm">Generating description for "{productName}"...</p>
                                </div>
                            )}
                            {error && (
                                <div className="flex-grow flex flex-col items-center justify-center text-red-600 dark:text-red-400">
                                    <p className="font-semibold">Generation Failed</p>
                                    <p className="text-sm mt-2 text-center max-w-md">{error}</p>
                                    <button onClick={generateDescription} className="btn btn-primary mt-4">Try Again</button>
                                </div>
                            )}
                            {!isLoading && !error && generatedDescription && (
                                <div className="flex-grow flex flex-col">
                                    <textarea
                                        readOnly
                                        value={generatedDescription}
                                        className="w-full flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm border-gray-200 dark:border-gray-600 resize-none"
                                        rows={10}
                                    />
                                </div>
                            )}
                        </div>

                        <footer className="bg-gray-50 dark:bg-gray-800/50 p-4 flex justify-end gap-3 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
                            <button onClick={onClose} type="button" className="btn bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600">
                                Cancel
                            </button>
                            <button onClick={handleApply} type="button" className="btn btn-primary" disabled={!generatedDescription || isLoading}>
                                Use this description
                            </button>
                        </footer>
                    </MotionDiv>
                </MotionDiv>
            )}
        </AnimatePresence>
    );
};

export default AiDescriptionModal;