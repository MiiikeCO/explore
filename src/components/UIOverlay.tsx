import React from 'react';
import { GameState } from '../types';

interface UIOverlayProps {
    gameState: GameState;
    distance: number | null;
    error: string | null;
    isApiLoaded: boolean;
    onGuessClick: () => void;
    onNextRoundClick: () => void;
    onResetApiKey: () => void;
}

const formatDistance = (distance: number | null) => {
    if (distance === null) return '';
    if (distance < 1000) {
        return `${Math.round(distance)} meters`;
    }
    return `${(distance / 1000).toFixed(1)} kilometers`;
};

const LoadingSpinner: React.FC<{ isApiLoaded: boolean }> = ({ isApiLoaded }) => (
    <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mb-4"></div>
        <p className="text-xl text-white">
            {isApiLoaded ? 'Finding a new location...' : 'Loading Map Engine...'}
        </p>
    </div>
);

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, distance, error, isApiLoaded, onGuessClick, onNextRoundClick, onResetApiKey }) => {
    if (gameState === GameState.LOADING && !error) {
        return (
            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                <LoadingSpinner isApiLoaded={isApiLoaded} />
            </div>
        );
    }
    
    if (gameState === GameState.ERROR) {
        return (
            <div className="absolute inset-0 bg-red-900 bg-opacity-90 flex flex-col items-center justify-center z-20 p-4 text-center">
                <h2 className="text-2xl font-bold mb-4">An Error Occurred</h2>
                <p className="text-lg mb-6">{error}</p>
                <div className="flex gap-4">
                    <button
                        onClick={onNextRoundClick}
                        className="px-8 py-3 bg-white text-red-900 font-bold rounded-full shadow-lg hover:bg-gray-200 transition-transform transform hover:scale-105"
                    >
                        Try Again
                    </button>
                    {error?.includes('API key') && (
                         <button
                            onClick={onResetApiKey}
                            className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-full shadow-lg hover:bg-yellow-500 transition-transform transform hover:scale-105"
                        >
                            Change API Key
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center z-20 pointer-events-none">
            {gameState === GameState.PLAYING && (
                 <button
                    onClick={onGuessClick}
                    className="pointer-events-auto px-10 py-4 bg-green-600 text-white font-bold text-xl rounded-full shadow-2xl hover:bg-green-700 transition-transform transform hover:scale-105"
                >
                    Make a Guess
                </button>
            )}

            {gameState === GameState.RESULT && (
                <div className="pointer-events-auto text-center bg-gray-900 bg-opacity-80 backdrop-blur-sm p-6 rounded-lg shadow-2xl animate-fade-in-up">
                    <h2 className="text-2xl font-light mb-2">Your guess was</h2>
                    <p className="text-5xl font-bold text-green-400 mb-6">{formatDistance(distance)}</p>
                    <h2 className="text-2xl font-light mb-2">away!</h2>
                    <button
                        onClick={onNextRoundClick}
                        className="mt-4 px-8 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
                    >
                        Play Again
                    </button>
                </div>
            )}
            <style>{`
                @keyframes fade-in-up {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default UIOverlay;
