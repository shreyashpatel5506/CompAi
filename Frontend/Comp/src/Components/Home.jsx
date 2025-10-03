import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import copy from 'copy-to-clipboard';
import Editor from '@monaco-editor/react';
import { Code, Clipboard, Check, AlertTriangle, Download, View } from "lucide-react";
import PreviewModal from './PreviewModal'; // Import the modal component

// Access the API Key from Environment Variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Correctly Initialize the Google AI Client
const genAI = new GoogleGenerativeAI(API_KEY);

const Home = () => {
    const [frameWork, setFrameWork] = useState(null);
    const [description, setDescription] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // --- UPDATED: Added Flutter & Dart ---
    const options = [
        { value: 'HTML & CSS', label: 'HTML & CSS', extension: 'html' },
        { value: 'JSX with TailwindCSS', label: 'JSX with TailwindCSS', extension: 'jsx' },
        { value: 'HTML & TailwindCSS', label: 'HTML & TailwindCSS', extension: 'html' },
        { value: 'Flutter & Dart', label: 'Flutter & Dart', extension: 'dart' },
        { value: 'Python & Django', label: 'Python & Django', extension: 'py' },
        { value: 'Python & Flask', label: 'Python & Flask', extension: 'py' },
        { value: 'Java & Spring', label: 'Java & Spring', extension: 'java' },
    ];

    const generateComponent = async () => {
        if (!description || !frameWork) {
            setError("Please select a framework and provide a description.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedCode('');

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // --- UPDATED: Refined prompt for better component generation ---
            const prompt = `
                You are an expert web and mobile developer. Your task is to generate a single file of production-ready code for a component.
                Framework/Language: ${frameWork.value}
                Component Description: ${description}

                **IMPORTANT RULES:**
                1. Output ONLY the raw code. No comments, explanations, markdown, or any text outside the code itself.
                2. For "JSX with TailwindCSS", the component MUST be a standard React functional component named exactly "Component". Example: \`function Component() { return <div>...</div>; }\` It must not be an arrow function or have \`export default\`.
                3. For "Flutter & Dart", create a single, complete Stateless or Stateful widget. Include all necessary imports from \`material.dart\`. The main widget should be named "MyComponent".
                4. The code must be fully functional and ready to be copy-pasted.
                5. For HTML & TailwindCSS, include the Tailwind CDN script. For HTML & CSS, embed the CSS in a <style> tag.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setGeneratedCode(text);

        } catch (err) {
            console.error("AI Generation Error:", err);
            setError("An unexpected error occurred. Please check your API key and console logs.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (copy(generatedCode)) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2500);
        }
    };

    const handleDownload = () => {
        if (!generatedCode || !frameWork) return;
        const blob = new Blob([generatedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `component.${frameWork.extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloaded(true);
        setTimeout(() => setIsDownloaded(false), 2500);
    };

    return (
        <>
            {/* --- FIXED: Main layout wrapper to prevent page scroll --- */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 lg:px-16 py-5' style={{ height: 'calc(100vh - 20px)' }}>

                {/* Left Panel: Input Form (no changes here) */}
                <div className="w-full py-6 rounded-xl bg-[var(--color-base-200)] p-5 self-start overflow-y-auto">
                    <h3 className='text-[25px] font-semibold sp-text'>AI Component Generator</h3>
                    <p className='text-gray-400 mt-2 text-[16px]'>Describe your component and let AI code it for you.</p>

                    <p className='text-[15px] font-[700] mt-4'>Framework</p>
                    <select
                        value={frameWork ? frameWork.value : ""}
                        onChange={(e) => {
                            const selectedOption = options.find(opt => opt.value === e.target.value) || null;
                            setFrameWork(selectedOption);
                        }}
                        className="w-full mt-2 p-3 bg-[var(--color-base-300)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="" disabled>Select a framework...</option>
                        {options.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <p className='text-[15px] font-[700] mt-4'>Component Description</p>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={10}
                        className="w-full mt-2 p-3 bg-[var(--color-base-300)] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="E.g., A responsive product card with an image, title, price, and an 'Add to Cart' button."
                    ></textarea>

                    <button
                        onClick={generateComponent}
                        disabled={isLoading}
                        className="mt-4 w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white py-3 px-4 rounded-lg hover:from-fuchsia-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold"
                    >
                        {isLoading ? 'Generating...' : 'Generate Component'}
                    </button>
                    {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
                </div>

                {/* Right Panel: Code Display */}
                {/* --- FIXED: Added h-full and flex-col to ensure proper height containment --- */}
                <div className="w-full py-6 rounded-xl bg-[var(--color-base-200)] p-5 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h3 className='text-[20px] font-semibold sp-text'>Generated Code</h3>
                        {generatedCode && (
                            <div className="flex gap-2">
                                <button onClick={() => setIsPreviewOpen(true)} className="flex items-center gap-2 text-sm bg-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-600 transition-colors">
                                    <View size={16} /> Preview
                                </button>
                                <button onClick={handleCopy} className="flex items-center gap-2 text-sm bg-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-600 transition-colors">
                                    {isCopied ? <><Check size={16} className="text-green-400" /> Copied!</> : <><Clipboard size={16} /> Copy</>}
                                </button>
                                <button onClick={handleDownload} className="flex items-center gap-2 text-sm bg-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-600 transition-colors">
                                    {isDownloaded ? <><Check size={16} className="text-green-400" /> Downloaded!</> : <><Download size={16} /> Download</>}
                                </button>
                            </div>
                        )}
                    </div>
                    {/* --- FIXED: flex-grow and min-h-0 are key to making the editor scroll internally --- */}
                    <div className='w-full border border-dashed border-gray-700 flex-grow bg-[var(--color-base-300)] rounded-lg overflow-hidden min-h-0'>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Code size={100} />
                                <p className="mt-4">AI is thinking...</p>
                            </div>
                        ) : generatedCode ? (
                            <Editor
                                height="100%"
                                theme="vs-dark"
                                language={frameWork?.extension === 'jsx' ? 'javascript' : (frameWork?.extension || 'html')}
                                value={generatedCode}
                                options={{ readOnly: true, minimap: { enabled: false } }}
                            />
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-full text-red-500 text-center p-4">
                                <AlertTriangle size={80} />
                                <p className="mt-4 font-semibold">Generation Failed</p>
                                <p className="text-sm text-gray-400 mt-1">{error}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <Code size={150} />
                                <p className="mt-4">Your code will appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                code={generatedCode}
                framework={frameWork}
            />
        </>
    );
};

export default Home;