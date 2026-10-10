import { BsSearch, BsTranslate } from "react-icons/bs";
import useTranslation from "../hooks/useTranslation";

const Search = ({ fetchWeather, setCity, handleLanguageChange }) => {
  const { t } = useTranslation();

  return (
    <div className='searchContainer relative flex flex-col justify-between items-center max-w-[500px] w-full m-auto pt-4 text-white z-[11]'>
      <form
        onSubmit={fetchWeather}
        className='flex justify-between items-center w-full m-auto p-3 bg-transparent border border-gray-300 text-white rounded-2xl'
      >
        <div>
          <input
            onChange={(e) => setCity(e.target.value)}
            className='bg-transparent border-none text-white focus:outline-none text-2xl'
            type='text'
            placeholder={t("placeholder")}
          />
        </div>
        <button onClick={fetchWeather}>
          <BsSearch size={20} />
        </button>
      </form>
      <button className='mt-2' onClick={handleLanguageChange}>
        <BsTranslate size={28} />
      </button>
    </div>
  );
};

export default Search;
