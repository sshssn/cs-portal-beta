import { Search, X } from 'lucide-react';
import { useState, InputHTMLAttributes, forwardRef } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear?: () => void;
    placeholder?: string;
    className?: string;
    containerClassName?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            value,
            onChange,
            onClear,
            placeholder = 'Search by phone, name, or customer...',
            className = '',
            containerClassName = '',
            ...props
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = useState('');
        const currentValue = value !== undefined ? value : internalValue;

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (value === undefined) {
                setInternalValue(e.target.value);
            }
            onChange?.(e);
        };

        const handleClear = () => {
            if (value === undefined) {
                setInternalValue('');
            }
            onClear?.();
        };

        return (
            <div className={`relative w-full ${containerClassName}`}>
                {/* Search Icon */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>

                {/* Input */}
                <input
                    ref={ref}
                    type="text"
                    value={currentValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            placeholder:text-gray-400 text-gray-900 bg-white
            transition-all duration-200
            ${className}`}
                    {...props}
                />

                {/* Clear Button */}
                {currentValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';

// Example usage component
export default function SearchInputDemo() {
    const [searchValue, setSearchValue] = useState('');

    return (
        <div className="w-full max-w-4xl mx-auto p-8 space-y-8">
            <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Global Search Component</h2>

                {/* Default Usage */}
                <SearchInput
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onClear={() => setSearchValue('')}
                />
            </div>

            {/* Different Variants */}
            <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-700">Variants</h3>

                {/* Small */}
                <SearchInput
                    placeholder="Small search..."
                    className="text-xs py-1.5"
                />

                {/* Medium (Default) */}
                <SearchInput
                    placeholder="Medium search (default)..."
                />

                {/* Large */}
                <SearchInput
                    placeholder="Large search..."
                    className="text-base py-3"
                />

                {/* Full width in container */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <SearchInput
                        placeholder="Search within a container..."
                    />
                </div>

                {/* Custom styling */}
                <SearchInput
                    placeholder="Custom styled search..."
                    className="border-blue-300 bg-blue-50"
                />

                {/* Disabled state */}
                <SearchInput
                    placeholder="Disabled search..."
                    disabled
                    className="opacity-50 cursor-not-allowed"
                />
            </div>

            {/* Usage Instructions */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm">
                <h3 className="font-semibold mb-2 text-gray-900">Usage Instructions:</h3>
                <div className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto text-xs space-y-1">
                    <p className="text-green-400">// 1. Copy the SearchInput component above</p>
                    <p className="text-green-400">// 2. Save it to your components folder</p>
                    <p className="text-green-400">// 3. Import and use in your project</p>
                    <br />
                    <p className="text-yellow-300">// Controlled example:</p>
                    <p>{'const [search, setSearch] = useState("");'}</p>
                    <p>{'<SearchInput'}</p>
                    <p>{'  value={search}'}</p>
                    <p>{'  onChange={(e) => setSearch(e.target.value)}'}</p>
                    <p>{'  onClear={() => setSearch("")}'}</p>
                    <p>{'/>'}</p>
                    <br />
                    <p className="text-yellow-300">// Uncontrolled example:</p>
                    <p>{'<SearchInput onChange={(e) => console.log(e.target.value)} />'}</p>
                </div>
            </div>
        </div>
    );
}

export { SearchInput };
