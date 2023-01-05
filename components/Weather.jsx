import Image from "next/image";

const Weather = ({ data, weatherIn, feelsLike, humidity, wind }) => {
  const description = data.weather[0].description;

  const uppDescription =
    description.charAt(0).toUpperCase() + description.slice(1);

  return (
    <div className="weatherContainer relative flex flex-col justify-between max-w-[500px] w-full h-[80vh] m-auto p-4 text-gray-300 z-10">
      {/* Top */}
      <div className="relative flex justify-between pt-12">
        <div className="flex flex-col items-center">
          <Image
            src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
            alt="/"
            width="100"
            height="100"
          />
          <p className="text-2xl">{uppDescription}</p>
        </div>
        <p className="text-8xl">{data.main.temp.toFixed(0)}&#176;C</p>
      </div>
      {/* Bottom */}

      <div className="bg-black/60 p-8 rounded-md">
        <p className="text-2xl text-center pb-6">{weatherIn + data.name}</p>
        <div className="flex justify-between text-center">
          <div>
            <p className="font-bold text-2xl">
              {data.main.feels_like.toFixed(0)}&#176;
            </p>
            <p className="text-xl">{feelsLike}</p>
          </div>
          <div>
            <p className="font-bold text-2xl">{data.main.humidity}%</p>
            <p className="text-xl">{humidity}</p>
          </div>
          <div>
            <p className="font-bold text-2xl">
              {data.wind.speed.toFixed(0)} m/s
            </p>
            <p className="text-xl">{wind}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
