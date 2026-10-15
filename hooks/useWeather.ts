import { useEffect, useState } from "react";
import axios from "axios";
import useTranslation from "./useTranslation";
import { getWeatherByCity } from "../services/weatherService";
import type { WeatherData } from "../types/weather";

interface UseWeatherOptions {
  onError?: (message: string) => void;
}

export default function useWeather({ onError }: UseWeatherOptions = {}) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCity, setLastCity] = useState("");

  const { t, locale } = useTranslation();

  const getWeather = (city: string) => {
    setIsLoading(true);
    getWeatherByCity(city, t("apiLang"))
      .then((data) => {
        setWeather(data);
        setLastCity(city);
      })
      .catch((error: unknown) => {
        const apiMessage = axios.isAxiosError(error)
          ? error.response?.data?.message
          : undefined;
        const message =
          t("errorMessage") ||
          apiMessage ||
          "Something went wrong. Please try again.";
        onError?.(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Refetch the displayed city so the API description matches the new locale
  // Maybe too much for a translation, but for an app this small, it works.
  useEffect(() => {
    if (lastCity) {
      getWeather(lastCity);
    }
  }, [locale]);

  return { weather, isLoading, getWeather };
}
