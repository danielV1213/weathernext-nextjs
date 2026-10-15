import type { SyntheticEvent } from "react";

export interface SearchProps {
  fetchWeather: (e: SyntheticEvent) => void;
  setCity: (city: string) => void;
  handleLanguageChange: () => void;
}
