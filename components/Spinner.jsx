import React from "react";
import spinner from "../public/spinner.gif";
import Image from "next/image";

const Spinner = () => {
  return (
    <div>
      <Image
        className='w-[150px] mx-auto my-[20vh] relative'
        src={spinner}
        alt='loading'
      />
    </div>
  );
};

export default Spinner;
