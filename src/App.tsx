import React, { useState, useEffect, useCallback } from 'react';
// FIX: Corrected import path from '../types' to './types'
import { GameState, LatLngLiteral } from './types';
import { findRandomStreetViewLocation } from './services/locationService';
import StreetView from './components/StreetView';
import GuessMap from './components/GuessMap';
import UIOverlay from './components/UIOverlay';

const API_KEY_STORAGE_KEY = 'googleMapsApiKey';

const ApiKeyInput: React.FC<{ onApiKeySubmit: (key: string) => void }> = ({ onApiKeySubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onApiKeySubmit(key.trim());
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-30 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Welcome to Geo Explorer</h1>
        <p className="text-gray-400 mb-6">To play, please enter your Google Maps API key. This key is stored only in your browser and is never sent to our servers.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your Google Maps API Key"
            className="p-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Google Maps API Key"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={!key.trim()}
          >
            Save & Start Game
          </button>
        </form>
         <p className="text-xs text-gray-500 mt-4">
            You need to enable the Maps JavaScript API and Street View Static API in your Google Cloud console. 
            <a href="https://console.cloud.google.com/google/maps-apis/overview" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">Get an API Key</a>
        </p>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem(API_KEY_STORAGE_KEY));
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [gameState, setGameState] = useState<GameState>(GameState.LOADING);
  const [actualLocation, setActualLocation] = useState<LatLngLiteral | null>(null);
  const [guessLocation, setGuessLocation] = useState<LatLngLiteral | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Effect to load the Google Maps API script dynamically and securely
  useEffect(() => {
    if (!apiKey) {
      // Don't load if there's no API key
      return;
    }
    
    if (window.google && window.google.maps) {
      setIsApiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsApiLoaded(true);
    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your API key and network connection.');
      setGameState(GameState.ERROR);
    };
    
    document.head.appendChild(script);

    return () => {
      // Clean up the script tag if the component unmounts
      const existingScript = document.querySelector(`script[src*="${apiKey}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [apiKey]);

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
  };

  const handleResetApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey(null);
    setIsApiLoaded(false);
    setGameState(GameState.LOADING);
    setError(null);
  };

  const startNewRound = useCallback(() => {
    setGameState(GameState.LOADING);
    setActualLocation(null);
    setGuessLocation(null);
    setDistance(null);
    setError(null);
    
    findRandomStreetViewLocation()
      .then(location => {
        setActualLocation(location);
        setGameState(GameState.PLAYING);
      })
      .catch(err => {
        console.error(err);
        setError('Could not find a suitable location. Please try again.');
        setGameState(GameState.ERROR);
      });
  }, []);

  // Effect to start a new round only after the API is loaded
  useEffect(() => {
    if (isApiLoaded) {
      startNewRound();
    }
  }, [isApiLoaded, round, startNewRound]);

  const handleGuess = (guessedLatLng: LatLngLiteral) => {
    if (!actualLocation) return;
    setGuessLocation(guessedLatLng);

    const actual = new window.google.maps.LatLng(actualLocation.lat, actualLocation.lng);
    const guess = new window.google.maps.LatLng(guessedLatLng.lat, guessedLatLng.lng);
    const calculatedDistance = window.google.maps.geometry.spherical.computeDistanceBetween(actual, guess);
    
    setDistance(calculatedDistance);
    setGameState(GameState.RESULT);
  };
  
  const handleNextRound = () => {
    setRound(prev => prev + 1);
  };

  if (!apiKey) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  const showGuessMap = gameState === GameState.GUESSING || gameState === GameState.RESULT;

  return (
    <div className="relative w-screen h-screen bg-gray-900 text-white font-sans overflow-hidden">
      {isApiLoaded && actualLocation && (
        <StreetView location={actualLocation} key={round} />
      )}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${showGuessMap ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
      />
      
      {isApiLoaded && showGuessMap && (
        <GuessMap 
          onGuess={handleGuess}
          gameState={gameState}
          actualLocation={actualLocation}
          guessLocation={guessLocation}
        />
      )}

      <UIOverlay 
        gameState={gameState}
        distance={distance}
        error={error}
        isApiLoaded={isApiLoaded}
        onGuessClick={() => setGameState(GameState.GUESSING)}
        onNextRoundClick={handleNextRound}
        onResetApiKey={handleResetApiKey}
      />
    </div>
  );
};

export default App;