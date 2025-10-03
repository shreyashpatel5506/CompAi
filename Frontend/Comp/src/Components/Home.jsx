import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import copy from 'copy-to-clipboard';
import Editor from '@monaco-editor/react';
import { Code, Clipboard, Check, AlertTriangle, Download, View, X, Monitor, Tablet, Smartphone } from "lucide-react";
// Import Babel Standalone to compile JSX in the browser
import { transform } from '@babel/standalone';

// Access the API Key from Environment Variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Correctly Initialize the Google AI Client
const genAI = new GoogleGenerativeAI(API_KEY);


// --- ENHANCED PREVIEW MODAL WITH JSX SUPPORT ---
const PreviewModal = ({ isOpen, onClose, code, framework }) => {
    const [viewMode, setViewMode] = useState('desktop');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [compileError, setCompileError] = useState(null);

    const isHtmlFramework = framework?.value.includes('HTML');
    const isJsxFramework = framework?.value.includes('JSX');

    useEffect(() => {
        if (!isOpen || !code) return;

        setCompileError(null); // Reset error on change

        if (isHtmlFramework) {
            setPreviewContent(code);
        } else if (isJsxFramework) {
            try {
                // 1. Compile JSX to regular JavaScript using Babel
                const compiledJs = transform(code, { presets: ['react'] }).code;

                // 2. Create a full HTML document with necessary scripts to render the component
                const htmlTemplate = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <script src="https://cdn.tailwindcss.com"></script>
                        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                        <style> body { background-color: white; } </style>
                    </head>
                    <body>
                        <div id="root"></div>
                        <script type="text/javascript">
                            // 3. Render the compiled component into the 'root' div
                            ${compiledJs}
                            const container = document.getElementById('root');
                            const root = ReactDOM.createRoot(container);
                            // Assumes the generated component is named "Component", which is a common convention
                            root.render(React.createElement(Component));
                        </script>
                    </body>
                    </html>
                `;
                setPreviewContent(htmlTemplate);
            } catch (error) {
                console.error("JSX Compilation Error:", error);
                setCompileError(error.message);
                setPreviewContent('');
            }
        } else {
            setPreviewContent(''); // For non-HTML/JSX frameworks
        }
    }, [isOpen, code, framework, isHtmlFramework, isJsxFramework]);


    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    if (!isOpen) return null;

    const viewClasses = {
        desktop: 'w-full h-full max-w-full',
        tablet: 'w-full h-full max-w-[768px] shadow-2xl rounded-lg',
        mobile: 'w-full h-full max-w-[420px] shadow-2xl rounded-lg'
    };

    return (
        <div className={`modal-backdrop ${isAnimatingOut ? 'modal-leave-active' : 'modal-enter-active'}`}>
            <div className={`modal-content ${isAnimatingOut ? 'modal-leave-active' : 'modal-enter-active'}`}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700 text-white flex-shrink-0">
                    <h3 className="font-bold text-lg">Component Preview</h3>
                    {(isHtmlFramework || (isJsxFramework && !compileError)) && (
                        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
                            <button onClick={() => setViewMode('desktop')} className={`p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-fuchsia-500' : 'hover:bg-gray-700'}`}><Monitor size={20} /></button>
                            <button onClick={() => setViewMode('tablet')} className={`p-2 rounded-md transition-colors ${viewMode === 'tablet' ? 'bg-fuchsia-500' : 'hover:bg-gray-700'}`}><Tablet size={20} /></button>
                            <button onClick={() => setViewMode('mobile')} className={`p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-fuchsia-500' : 'hover:bg-gray-700'}`}><Smartphone size={20} /></button>
                        </div>
                    )}
                    <button className="p-2 rounded-full hover:bg-gray-700 transition-colors" onClick={handleClose}><X size={24} /></button>
                </div>

                {/* Body */}
                <div className="flex-grow p-4 md:p-6 bg-[#1e1e1e] overflow-auto flex items-center justify-center">
                    {previewContent ? (
                        <div className={`transition-all duration-300 ease-in-out ${viewClasses[viewMode]}`}>
                            <div className="bg-gray-800 rounded-t-lg flex items-center p-2 gap-1.5">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <iframe
                                srcDoc={previewContent}
                                title="Preview"
                                className="w-full h-[80vh] bg-white border-none rounded-b-lg"
                                sandbox="allow-scripts allow-same-origin"
                            />
                        </div>
                    ) : compileError ? (
                        <div className="text-center text-white bg-red-900/50 p-8 rounded-lg max-w-2xl">
                            <AlertTriangle size={60} className="mx-auto text-red-400 mb-4" />
                            <h4 className="font-bold text-xl mb-2">JSX Compilation Failed</h4>
                            <p className="text-red-300 font-mono bg-gray-900 p-3 rounded-md text-sm">{compileError}</p>
                        </div>
                    ) : (
                        <div className="text-center text-white bg-gray-900/50 p-8 rounded-lg">
                            <Code size={60} className="mx-auto text-cyan-400 mb-4" />
                            <h4 className="font-bold text-xl mb-2">Live Preview Not Available</h4>
                            <p className="text-gray-400 max-w-md">This preview is only available for HTML and JSX-based frameworks.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const Home = () => {
    const [frameWork, setFrameWork] = useState(null);
    const [description, setDescription] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const options = [
        { value: 'HTML & CSS', label: 'HTML & CSS', extension: 'html' },
        { value: 'JSX with TailwindCSS', label: 'JSX with TailwindCSS', extension: 'jsx' },
        { value: 'HTML & TailwindCSS', label: 'HTML & TailwindCSS', extension: 'html' },
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
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-09-2025" });

            const prompt = `
                You are an expert web developer specializing in creating clean, modern, and responsive components.
                Your task is to generate a single file of production-ready code for a web component based on the description I provide.
                Framework/Language: ${frameWork.value}
                Component Description: ${description}

                IMPORTANT RULES:
                - Output ONLY the raw code for the component. Do not include any comments, explanations, markdown, or any text outside of the code.
                - For "JSX with TailwindCSS", the component MUST be a standard React functional component named "Component". For example: \`const Component = () => { return <div>...</div>; };\`
                - The component must be fully functional and ready to be copy-pasted.
                - For HTML & TailwindCSS, include the Tailwind CDN script in a <head> tag.
                - For HTML & CSS, embed the CSS in a <style> tag.
                - Use placeholder images from picsum.photos if needed.
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
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 lg:px-16'>
                {/* Left Panel: Input Form */}
                <div className="w-full py-6 rounded-xl bg-[var(--color-base-200)] mt-5 p-5 self-start">
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
                <div className="w-full py-6 rounded-xl bg-[var(--color-base-200)] mt-5 p-5 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
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
                    <div className='w-full border-radius-lg border border-dashed border-gray-700 flex-grow bg-[var(--color-base-300)] rounded-lg overflow-hidden'>
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

            {/* The Preview Modal gets rendered here */}
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