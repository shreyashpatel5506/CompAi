import React, { useState, useEffect } from 'react';
import { X, Monitor, Tablet, Smartphone, Code, AlertTriangle } from "lucide-react";
// NEW: Import Babel Standalone to compile JSX
import { transform } from '@babel/standalone';

// --- ENHANCED PREVIEW MODAL WITH JSX SUPPORT ---
const PreviewModal = ({ isOpen, onClose, code, framework }) => {
    const [viewMode, setViewMode] = useState('desktop');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    // NEW: State to hold the final HTML for the iframe
    const [previewContent, setPreviewContent] = useState('');
    // NEW: State to catch compilation errors
    const [compileError, setCompileError] = useState(null);

    const isHtmlFramework = framework?.value.includes('HTML');
    const isJsxFramework = framework?.value.includes('JSX');

    // NEW: This effect now compiles JSX or sets HTML directly
    useEffect(() => {
        if (!isOpen || !code) return;

        setCompileError(null); // Reset error on change

        if (isHtmlFramework) {
            setPreviewContent(code);
        } else if (isJsxFramework) {
            try {
                // 1. Compile JSX to regular JavaScript using Babel
                const compiledJs = transform(code, {
                    presets: ['react']
                }).code;

                // 2. Create a full HTML document with necessary scripts
                const htmlTemplate = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-g">
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
                            // Assumes the generated component is named "Component" or is the default export
                            root.render(React.createElement(Component || exports.default));
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
            setPreviewContent('');
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

    // --- RENDER LOGIC ---
    return (
        <div className={`modal-backdrop ${isAnimatingOut ? 'modal-leave-active' : 'modal-enter-active'}`}>
            <div className={`modal-content ${isAnimatingOut ? 'modal-leave-active' : 'modal-enter-active'}`}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700 text-white flex-shrink-0">
                    <h3 className="font-bold text-lg">Component Preview</h3>
                    {(isHtmlFramework || (isJsxFramework && !compileError)) && (
                        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
                            {/* View Toggles */}
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

export default PreviewModal;