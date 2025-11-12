/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import supabase, { getUser } from '@/lib/supabase';

interface Props {
  onSearchSubmit: (values: { start?: string; end?: string }) => void;
  startQuery: string;
  endQuery: string;
  setStartQuery: React.Dispatch<React.SetStateAction<string>>;
  setEndQuery: React.Dispatch<React.SetStateAction<string>>;
}

interface Suggestion {
  place_name: string;
  center: [number, number];
}

export default function SearchBar({ onSearchSubmit }: Props) {
  const [startQuery, setStartQuery] = useState('');
  const [endQuery, setEndQuery] = useState('');
  const [startSuggestions, setStartSuggestions] = useState<Suggestion[]>([]);
  const [endSuggestions, setEndSuggestions] = useState<Suggestion[]>([]);
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null);
  const [startHistory, setStartHistory] = useState<string[]>([]);
  const [endHistory, setEndHistory] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID on mount
  useEffect(() => {
    getUser().then(user => {
      setUserId(user?.id || null);
    });
  }, []);

  // Fetch address history from Supabase
  const fetchAddressHistory = async (type: 'start' | 'end') => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('address_history')
      .select('address')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false })
      .limit(5);
    if (!error && data) {
      const addresses = data.map((row: any) => row.address);
      if (type === 'start') setStartHistory(addresses);
      else setEndHistory(addresses);
    }
  };

  // Save address to Supabase
  const saveAddressToHistory = async (address: string, type: 'start' | 'end') => {
    if (!userId || !address) return;
    // Prevent duplicates by checking current history
    const history = type === 'start' ? startHistory : endHistory;
    if (history.includes(address)) return;
    await supabase.from('address_history').insert([
      { user_id: userId, address, type }
    ]);
    fetchAddressHistory(type);
  };

  const fetchSuggestions = async (query: string, field: 'start' | 'end') => {
    if (!query) {
      if (field === 'start') setStartSuggestions([]);
      else setEndSuggestions([]);
      return;
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?proximity=ip&autocomplete=true&bbox=-74.25909,40.477399,-73.700181,40.917577&access_token=${accessToken}`
    );
    const data = await res.json();
    if (!data.features) return;

    const suggestions = data.features.map((f: any) => ({
      place_name: f.place_name,
      center: f.center,
    }));

    if (field === 'start') setStartSuggestions(suggestions);
    else setEndSuggestions(suggestions);
  };

  const handleSuggestionClick = async (suggestion: Suggestion, field: 'start' | 'end') => {
    if (field === 'start') {
      setStartQuery(suggestion.place_name);
      setStartSuggestions([]);
      await saveAddressToHistory(suggestion.place_name, 'start');
    } else {
      setEndQuery(suggestion.place_name);
      setEndSuggestions([]);
      await saveAddressToHistory(suggestion.place_name, 'end');
    }
  };

  // Handle history click
  const handleHistoryClick = (address: string, field: 'start' | 'end') => {
    if (field === 'start') {
      setStartQuery(address);
      setStartSuggestions([]);
      fetchSuggestions(address, 'start');
    } else {
      setEndQuery(address);
      setEndSuggestions([]);
      fetchSuggestions(address, 'end');
    }
  };

  const handleSubmit = async () => {
    const values: { start?: string; end?: string } = {};
    if (startQuery.trim()) values.start = startQuery.trim();
    if (endQuery.trim()) values.end = endQuery.trim();
    if (startQuery.trim()) await saveAddressToHistory(startQuery.trim(), 'start');
    if (endQuery.trim()) await saveAddressToHistory(endQuery.trim(), 'end');
    onSearchSubmit(values);
  };

  return (
    <div className="absolute top-10 left-4 z-50 bg-white dark:bg-black bg-opacity-10 border-white border-opacity-20 rounded-xl p-2 shadow-lg w-[320px] space-y-3">
      <div className="relative">
        <label className="text-sm font-medium text-black dark:text-white">Start Location</label>
        <input
          type="text"
          value={startQuery}
          onChange={(e) => {
            setStartQuery(e.target.value);
            fetchSuggestions(e.target.value, 'start');
          }}
          onFocus={() => {
            setActiveField('start');
            if (!startQuery) fetchAddressHistory('start');
          }}
          placeholder="Search start..."
          className="w-full px-3 py-2 text-sm border border-gray-700 bg-transparent text-black dark:text-white rounded mt-1 focus:outline-none focus:border-blue-500"
        />
        {activeField === 'start' && !startQuery && startHistory.length > 0 && (
          <ul className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-700 rounded shadow max-h-48 overflow-y-auto z-50">
            {startHistory.map((address, i) => (
              <li
                key={i}
                onClick={() => handleHistoryClick(address, 'start')}
                className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {address}
              </li>
            ))}
          </ul>
        )}
        {activeField === 'start' && startQuery && startSuggestions.length > 0 && (
          <ul className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-700 rounded shadow max-h-48 overflow-y-auto z-50">
            {startSuggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSuggestionClick(s, 'start')}
                className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {s.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        <label className="text-sm font-medium text-black dark:text-white">End Location</label>
        <input
          type="text"
          value={endQuery}
          onChange={(e) => {
            setEndQuery(e.target.value);
            fetchSuggestions(e.target.value, 'end');
          }}
          onFocus={() => {
            setActiveField('end');
            if (!endQuery) fetchAddressHistory('end');
          }}
          placeholder="Search destination..."
          className="w-full px-3 py-2 text-sm border border-gray-700 bg-transparent text-black dark:text-white rounded mt-1 focus:outline-none focus:border-blue-500"
        />
        {activeField === 'end' && !endQuery && endHistory.length > 0 && (
          <ul className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-700 rounded shadow max-h-48 overflow-y-auto z-50">
            {endHistory.map((address, i) => (
              <li
                key={i}
                onClick={() => handleHistoryClick(address, 'end')}
                className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {address}
              </li>
            ))}
          </ul>
        )}
        {activeField === 'end' && endQuery && endSuggestions.length > 0 && (
          <ul className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-700 rounded shadow max-h-48 overflow-y-auto z-50">
            {endSuggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSuggestionClick(s, 'end')}
                className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                {s.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white text-sm px-3 py-2 rounded hover:bg-blue-600 transition"
      >
        Go
      </button>
    </div>
  );
}
