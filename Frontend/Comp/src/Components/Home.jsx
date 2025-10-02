import React, { useState } from 'react'; // Make sure useState is imported
import Navbar from './Navbar';
import Select from 'react-select';

const Home = () => {
    // --- START: Added State and Function Definitions ---
    const [frameWork, setFrameWork] = useState(null); // State for the selected framework
    const [description, setDescription] = useState(''); // State for the textarea input

    // Placeholder function for the button's onClick event
    const generateComponent = () => {
        console.log("Generating component with:");
        console.log("Framework:", frameWork ? frameWork.value : 'None');
        console.log("Description:", description);
        // Add your AI generation logic here
    };
    // --- END: Added State and Function Definitions ---

    const options = [
        { value: 'HTML-CSS', label: 'HTML & CSS' },
        { value: 'JSX', label: 'JSX' },
        { value: 'HTML-TAILWIND', label: 'HTML & TailwindCSS' },
        { value: 'JSX-TAILWIND', label: 'JSX & TailwindCSS' },
        { value: 'Dart-Flutter', label: 'Dart & Flutter' },
        { value: 'Python-Django', label: 'Python & Django' },
        { value: 'Python-Flask', label: 'Python & Flask' },
        { value: 'Python-FastAPI', label: 'Python & FastAPI' },
        { value: 'Java-Spring', label: 'Java & Spring' },
        { value: 'CSharp-ASP.NET', label: 'C# & ASP.NET' },
    ];

    return (
        <>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 lg:px-16'>
                {/* left pannel */}
                <div className="w-full py-6 rounded-xl bg-[var(--color-base-200)] mt-5 p-5">
                    <h3 className='text-[25px] font-semibold sp-text'>AI Component Generator</h3>
                    <p className='text-gray-400 mt-2 text-[16px]'>Describe your component and let AI code it for you.</p>

                    <p className='text-[15px] font-[700] mt-4'>Framework</p>
                    <Select
                        className='mt-2'
                        options={options}
                        value={frameWork}
                        placeholder="Select a framework..." // Added a placeholder for better UX
                        styles={{
                            control: (base) => ({
                                ...base,
                                backgroundColor: "var(--color-base-300)",
                                borderColor: "#333",
                                color: "#fff",
                                boxShadow: "none",
                                "&:hover": { borderColor: "#555" }
                            }),
                            menu: (base) => ({
                                ...base,
                                backgroundColor: "var(--color-base-300)",
                                color: "#fff"
                            }),
                            option: (base, state) => ({
                                ...base,
                                backgroundColor: state.isSelected
                                    ? "var(--color-base-300)"
                                    : state.isFocused
                                        ? "var(--color-base-200)"
                                        : "var(--color-base-100)",
                                color: "#fff",
                                "&:active": { backgroundColor: "#444" }
                            }),
                            singleValue: (base) => ({ ...base, color: "#fff" }),
                            placeholder: (base) => ({ ...base, color: "#aaa" }),
                            input: (base) => ({ ...base, color: "#fff" })
                        }}
                        onChange={(selected) => setFrameWork(selected)}
                    />
                    <p className='text-[15px] font-[700] mt-4'>Component Description</p>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full mt-2 p-3 bg-[var(--color-base-300)] border border-gray-700 h-[400px] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="E.g., A responsive navbar with a dropdown menu"
                    ></textarea>
                    <button
                        onClick={generateComponent}
                        className="mt-4 w-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-fuchsia-600 hover:to-cyan-600 transition"
                    >
                        Generate Component
                    </button>
                </div>

                {/* Right panel would go here */}
                <div>
                    <div className="w-full pt-6 rounded-xl bg-[var(--color-base-200)] mt-5 p-5 pb-0 h-full flex items-center justify-center"
                    >
                        <h3 className='text-[20px] font-semibold sp-text'>Your generated component will appear here.</h3>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Home;