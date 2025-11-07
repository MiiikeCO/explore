// Fix: Add a global declaration for the 'google' object to inform TypeScript
// that it exists on the global/window scope. This is necessary because the
// Google Maps API is loaded externally via a <script> tag. This single
// change resolves all 'google is not defined' errors across the application.
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
