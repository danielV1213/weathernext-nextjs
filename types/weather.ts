export interface WeatherCondition {
  description: string;
  icon: string;
}

export interface WeatherData {
  name: string;
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}
