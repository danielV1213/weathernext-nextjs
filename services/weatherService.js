import axios from "axios";

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

export const getWeatherByCity = (city, lang) =>
  axios
    .get(BASE_URL, {
      params: {
        q: city,
        units: "metric",
        lang,
        appid: process.env.NEXT_PUBLIC_WEATHER_KEY,
      },
    })
    .then((response) => response.data);
