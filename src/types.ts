// FIX: Add a global declaration for the Google Maps API object.
// This resolves TypeScript errors about 'google' not being defined on 'window'
// and the 'google' namespace not being found.
declare global {
  var google: any;
}

export enum GameState {
  LOADING,
  PLAYING,
  GUESSING,
  RESULT,
  ERROR,
}

export interface LatLngLiteral {
  lat: number;
  lng: number;
}
