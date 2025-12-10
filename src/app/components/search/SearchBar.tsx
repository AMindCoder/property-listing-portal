'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    onSearch: (value: string) => void
    placeholder?: string
    className?: string
}

export default function SearchBar({
    value,
    onChange,
    onSearch,
    placeholder = 'Search properties by name, location, area...',
    className = ''
}: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestions, setSuggestions] = useState<any>({ areas: [], types: [], properties: [] })
    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const debouncedValue = useDebounce(value, 300)

    // Load recent searches from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('recentSearches')
            if (saved) {
                setRecentSearches(JSON.parse(saved))
            }
        } catch (error) {
            console.error('Failed to load recent searches:', error)
        }
    }, [])

    // Fetch suggestions when debounced value changes
    useEffect(() => {
        if (debouncedValue && debouncedValue.length > 0) {
            fetchSuggestions(debouncedValue)
            onSearch(debouncedValue)
        } else if (debouncedValue === '') {
            onSearch('')
        }
    }, [debouncedValue])

    const fetchSuggestions = async (query: string) => {
        try {
            const response = await fetch(`/api/properties/suggestions?q=${encodeURIComponent(query)}`)
            const data = await response.json()
            if (data.success) {
                setSuggestions(data.data)
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error)
            setSuggestions({ areas: [], types: [], properties: [] })
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        onChange(newValue)
        setSelectedIndex(-1)
        if (newValue.trim()) {
            setShowSuggestions(true)
        }
    }

    const handleClear = () => {
        onChange('')
        onSearch('')
        setSuggestions({ areas: [], types: [], properties: [] })
        setShowSuggestions(false)
        inputRef.current?.focus()
    }

    const handleSelectSuggestion = (suggestion: string) => {
        onChange(suggestion)
        onSearch(suggestion)
        saveRecentSearch(suggestion)
        setShowSuggestions(false)
        inputRef.current?.blur()
    }

    const saveRecentSearch = (search: string) => {
        if (!search.trim()) return

        try {
            let recent = [...recentSearches]
            // Remove duplicate if exists
            recent = recent.filter(s => s !== search)
            // Add to beginning
            recent.unshift(search)
            // Keep only top 10
            recent = recent.slice(0, 10)

            setRecentSearches(recent)
            localStorage.setItem('recentSearches', JSON.stringify(recent))
        } catch (error) {
            console.error('Failed to save recent search:', error)
        }
    }

    const clearRecentSearches = () => {
        setRecentSearches([])
        try {
            localStorage.removeItem('recentSearches')
        } catch (error) {
            console.error('Failed to clear recent searches:', error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions) {
            if (e.key === 'Enter' && value.trim()) {
                saveRecentSearch(value)
            }
            return
        }

        const allSuggestions = [
            ...recentSearches.slice(0, 3).map(s => ({ type: 'recent', value: s })),
            ...suggestions.areas.map((a: string) => ({ type: 'area', value: a })),
            ...suggestions.types.map((t: string) => ({ type: 'type', value: t })),
            ...suggestions.properties.map((p: any) => ({ type: 'property', value: p.title }))
        ]

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < allSuggestions.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : allSuggestions.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
                    handleSelectSuggestion(allSuggestions[selectedIndex].value)
                } else if (value.trim()) {
                    saveRecentSearch(value)
                    setShowSuggestions(false)
                }
                break
            case 'Escape':
                setShowSuggestions(false)
                setSelectedIndex(-1)
                break
        }
    }

    const handleFocus = () => {
        setIsFocused(true)
        if (value.trim() || recentSearches.length > 0) {
            setShowSuggestions(true)
        }
    }

    const handleBlur = (e: React.FocusEvent) => {
        // Delay to allow clicking on suggestions
        setTimeout(() => {
            if (!dropdownRef.current?.contains(document.activeElement)) {
                setIsFocused(false)
                setShowSuggestions(false)
                setSelectedIndex(-1)
            }
        }, 200)
    }

    // Calculate if we have any suggestions to show
    const hasRecentSearches = recentSearches.length > 0 && (!value.trim() || isFocused)
    const hasSuggestions = value.trim() && (
        suggestions.areas.length > 0 ||
        suggestions.types.length > 0 ||
        suggestions.properties.length > 0
    )

    const shouldShowDropdown = showSuggestions && (hasRecentSearches || hasSuggestions)

    return (
        <div className={`search-bar-container ${className}`} role="search">
            <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
                <svg
                    className="search-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                <input
                    ref={inputRef}
                    type="text"
                    className="search-input"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    aria-label="Search properties"
                    aria-autocomplete="list"
                    aria-expanded={Boolean(shouldShowDropdown)}
                    aria-controls={shouldShowDropdown ? "search-suggestions" : undefined}
                />

                {value && (
                    <button
                        type="button"
                        className="search-clear"
                        onClick={handleClear}
                        aria-label="Clear search"
                        tabIndex={0}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M15 5L5 15M5 5l10 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {shouldShowDropdown && (
                <div
                    id="search-suggestions"
                    ref={dropdownRef}
                    className="search-suggestions-dropdown"
                    role="listbox"
                >
                    {/* Recent Searches */}
                    {hasRecentSearches && (
                        <div className="suggestion-category">
                            <div className="suggestion-category-header">
                                <span>Recent</span>
                                <button
                                    className="clear-recent"
                                    onClick={clearRecentSearches}
                                    type="button"
                                >
                                    Clear
                                </button>
                            </div>
                            {recentSearches.slice(0, 3).map((search, idx) => (
                                <div
                                    key={`recent-${idx}`}
                                    className={`suggestion-item ${selectedIndex === idx ? 'selected' : ''}`}
                                    onMouseDown={() => handleSelectSuggestion(search)}
                                    role="option"
                                    aria-selected={selectedIndex === idx}
                                >
                                    <svg className="suggestion-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <span>{search}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Areas */}
                    {suggestions.areas.length > 0 && (
                        <div className="suggestion-category">
                            <div className="suggestion-category-header">
                                <span>Areas</span>
                            </div>
                            {suggestions.areas.map((area: string, idx: number) => {
                                const globalIdx = recentSearches.slice(0, 3).length + idx
                                return (
                                    <div
                                        key={`area-${idx}`}
                                        className={`suggestion-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                                        onMouseDown={() => handleSelectSuggestion(area)}
                                        role="option"
                                        aria-selected={selectedIndex === globalIdx}
                                    >
                                        <svg className="suggestion-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 2C6.067 2 4.5 3.567 4.5 5.5c0 3.25 3.5 8.5 3.5 8.5s3.5-5.25 3.5-8.5C11.5 3.567 9.933 2 8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="8" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        <span>{area}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Property Types */}
                    {suggestions.types.length > 0 && (
                        <div className="suggestion-category">
                            <div className="suggestion-category-header">
                                <span>Types</span>
                            </div>
                            {suggestions.types.map((type: string, idx: number) => {
                                const globalIdx = recentSearches.slice(0, 3).length + suggestions.areas.length + idx
                                return (
                                    <div
                                        key={`type-${idx}`}
                                        className={`suggestion-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                                        onMouseDown={() => handleSelectSuggestion(type)}
                                        role="option"
                                        aria-selected={selectedIndex === globalIdx}
                                    >
                                        <svg className="suggestion-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M2 14h12V6L8 2 2 6v8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                            <path d="M6 14v-4h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                                        </svg>
                                        <span>{type}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Properties */}
                    {suggestions.properties.length > 0 && (
                        <div className="suggestion-category">
                            <div className="suggestion-category-header">
                                <span>Properties</span>
                            </div>
                            {suggestions.properties.map((property: any, idx: number) => {
                                const globalIdx = recentSearches.slice(0, 3).length + suggestions.areas.length + suggestions.types.length + idx
                                return (
                                    <div
                                        key={`property-${idx}`}
                                        className={`suggestion-item ${selectedIndex === globalIdx ? 'selected' : ''}`}
                                        onMouseDown={() => handleSelectSuggestion(property.title)}
                                        role="option"
                                        aria-selected={selectedIndex === globalIdx}
                                    >
                                        <svg className="suggestion-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <rect x="2" y="3" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
                                            <path d="M6 7h4M6 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <div className="suggestion-property">
                                            <span className="property-title">{property.title}</span>
                                            <span className="property-location">{property.area}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
