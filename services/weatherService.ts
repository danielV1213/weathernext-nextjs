import axios from "axios";
import type { WeatherData } from "../types/weather";

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const getWeatherByCity = (
  city: string,
  lang: string,
): Promise<WeatherData> =>
  axios
    .get<WeatherData>(BASE_URL, {
      params: {
        q: city,
        units: "metric",
        lang,
        appid: process.env.NEXT_PUBLIC_WEATHER_KEY,
      },
    })
    .then((response) => response.data);
