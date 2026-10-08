import React from "react";
import spinner from "../public/spinner.gif";
import Image from "next/image";

const Spinner = () => {
  return (
    <div>
      <Image
        className='w-[180px] mx-auto my-[20vh] relative z-10'
        src={spinner}
        alt='loading'
      />
    </div>
  );
};

export default Spinner;
