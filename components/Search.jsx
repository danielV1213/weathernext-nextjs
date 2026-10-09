import { Fragment } from "react";
import { IconButton, Snackbar } from "@material-ui/core";
import { BsSearch, BsTranslate } from "react-icons/bs";
import CloseIcon from "@material-ui/icons/Close";

const Search = ({
  labels,
  fetchWeather,
  setCity,
  handleLanguageChange,
  isOpen,
  handleToClose,
}) => {
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
            placeholder={labels.placeholder}
          />
        </div>
        <button onClick={fetchWeather}>
          <BsSearch size={20} />
        </button>
      </form>
      <button className='mt-2' onClick={handleLanguageChange}>
        <BsTranslate size={28} />
      </button>
      <Snackbar
        anchorOrigin={{
          horizontal: "left",
          vertical: "bottom",
        }}
        open={isOpen}
        autoHideDuration={5000}
        message={labels.snackbarMessage || labels.langSB}
        onClose={handleToClose}
        action={
          <Fragment>
            <IconButton
              size='medium'
              aria-label='close'
              color='inherit'
              onClick={handleToClose}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Fragment>
        }
      />
    </div>
  );
};

export default Search;
