import { useEffect, useState } from "react";
import useTranslation from "./useTranslation";
import { getWeatherByCity } from "../services/weatherService";

export default function useWeather({ onError } = {}) {
  const [weather, setWeather] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastCity, setLastCity] = useState("");

  const { t, locale } = useTranslation();

  const getWeather = (city) => {
    setIsLoading(true);
    getWeatherByCity(city, t("apiLang"))
      .then((data) => {
        setWeather(data);
        setLastCity(city);
      })
      .catch((error) => {
        const message =
          t("errorMessage") ||
          error.response?.data?.message ||
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
