"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, X, Filter as FilterIcon, Check } from "lucide-react";

interface Filter {
  key: string;
  operator: "equals" | "contains";
  value: string;
}

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

  // Form State
  const [newKey, setNewKey] = useState("");
  const [newOperator, setNewOperator] = useState<"equals" | "contains">("equals");
  const [newValue, setNewValue] = useState("");

  // 1. Load Filters from URL on Mount
  useEffect(() => {
    const filterParam = searchParams.get("filters");
    if (filterParam) {
      try {
        // Format: key:op:value,key:op:value
        const parsed = filterParam.split(",").map(f => {
           const [key, operator, value] = f.split(":");
           return { key, operator: operator as any, value };
        });
        setActiveFilters(parsed);
      } catch (e) {
        console.error("Failed to parse filters", e);
      }
    } else {
        setActiveFilters([]);
    }
  }, [searchParams]);

  // 2. Update URL when filters change
  const updateUrl = (filters: Filter[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (filters.length > 0) {
      const serialized = filters
        .map(f => `${f.key}:${f.operator}:${f.value}`)
        .join(",");
      params.set("filters", serialized);
    } else {
      params.delete("filters");
    }
    
    router.push(`?${params.toString()}`);
  };

  const addFilter = () => {
    if (!newKey || !newValue) return;
    const newFilter: Filter = { key: newKey, operator: newOperator, value: newValue };
    const updated = [...activeFilters, newFilter];
    setActiveFilters(updated);
    updateUrl(updated);
    
    // Reset Form
    setNewKey("");
    setNewValue("");
    setIsOpen(false);
  };

  const removeFilter = (index: number) => {
    const updated = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(updated);
    updateUrl(updated);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Active Filter Chips */}
      {activeFilters.map((filter, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm text-sm">
          <span className="text-gray-500 font-medium">{filter.key}</span>
          <span className="text-gray-300 text-xs uppercase">{filter.operator === 'equals' ? '=' : '~'}</span>
          <span className="font-bold text-gray-900">{filter.value}</span>
          <button onClick={() => removeFilter(i)} className="ml-1 p-0.5 hover:bg-gray-100 rounded-full">
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>
      ))}

      {/* Add Filter Button / Popover */}
      <div className="relative">
        {!isOpen ? (
            <button 
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm font-medium transition-colors"
            >
                <Plus className="w-4 h-4" />
                Filter
            </button>
        ) : (
            <div className="absolute top-0 left-0 z-50 mt-0 w-[300px] bg-white rounded-xl shadow-xl border border-gray-200 p-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase">New Filter</span>
                    <button onClick={() => setIsOpen(false)}>
                        <X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                
                <div className="space-y-2">
                    {/* Property Key */}
                    <input 
                        className="w-full text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                        placeholder="Property (e.g. plan)"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        autoFocus
                    />

                    <div className="flex gap-2">
                        {/* Operator */}
                        <select 
                            className="text-sm px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                            value={newOperator}
                            onChange={(e) => setNewOperator(e.target.value as any)}
                        >
                            <option value="equals">Equals (=)</option>
                            <option value="contains">Contains (~)</option>
                        </select>
                        
                        {/* Value */}
                        <input 
                            className="flex-1 min-w-0 text-sm px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-black"
                            placeholder="Value (e.g. premium)"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addFilter()}
                        />
                    </div>

                    <button 
                        onClick={addFilter}
                        disabled={!newKey || !newValue}
                        className="w-full mt-2 flex items-center justify-center gap-2 bg-black text-white text-sm font-bold py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                        <Check className="w-4 h-4" /> Apply Filter
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}