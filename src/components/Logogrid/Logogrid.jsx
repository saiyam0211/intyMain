import React from "react";
import Banner1 from "../../assets/103_logo 1.png";
import Banner2 from "../../assets/logo2.png";
import Banner3 from "../../assets/143_logo 3.png";
import Banner4 from "../../assets/141_logo 4.png";
import Marquee from "react-fast-marquee";

const LogoGrid = () => {
  return (
    <>
      <div>
        <Marquee
          direction="left"
          gradient={false}
          speed={120}
          className="flex justify-center gap-8 mb-6"
        >
          <img src={Banner2} alt="Logo 2" className="w-16 h-16 ml-40" />
          <img src={Banner3} alt="Logo 3" className="w-16 h-16 ml-40" />
          <img src={Banner1} alt="Logo 1" className="w-16 h-16 ml-40" />
          <img src={Banner4} alt="Logo 4" className="w-16 h-16 ml-40" />
          <img src={Banner2} alt="Logo 2" className="w-16 h-16 ml-40" />
          <img src={Banner3} alt="Logo 3" className="w-16 h-16 ml-40" />
          <img src={Banner1} alt="Logo 1" className="w-16 h-16 ml-40" />
          <img src={Banner4} alt="Logo 4" className="w-16 h-16 ml-40" />
        </Marquee>
        <Marquee
          direction="right"
          gradient={false}
          speed={120}
          className="flex justify-between gap-8 mb-6"
        >
          <img src={Banner2} alt="Logo 2" className="w-18 h-18 ml-40" />
          <img src={Banner3} alt="Logo 3" className="w-16 h-16 ml-40" />
          <img src={Banner1} alt="Logo 1" className="w-16 h-16 ml-40" />
          <img src={Banner4} alt="Logo 4" className="w-16 h-16 ml-40" />
          <img src={Banner2} alt="Logo 2" className="w-16 h-16 ml-40" />
          <img src={Banner3} alt="Logo 3" className="w-16 h-16 ml-40" />
          <img src={Banner1} alt="Logo 1" className="w-16 h-16 ml-40" />
          <img src={Banner4} alt="Logo 4" className="w-16 h-16 ml-40" />
        </Marquee>
        <Marquee
          direction="left"
          gradient={false}
          speed={120}
          className="flex justify-center gap-4"
        >
          <img src={Banner1} alt="Logo 1" className="w-16 h-16 ml-40" />
          <img src={Banner2} alt="Logo 2" className="w-16 h-16 ml-40" />
          <img src={Banner3} alt="Logo 3" className="w-16 h-16 ml-40" />
          <img src={Banner4} alt="Logo 4" className="w-16 h-16 ml-40" />
          <img src={Banner2} alt="Logo 2" className="w-16 h-16 ml-40" />
          <img src={Banner3} alt="Logo 3" className="w-16 h-16 ml-40" />
          <img src={Banner1} alt="Logo 1" className="w-16 h-16 ml-40" />
          <img src={Banner4} alt="Logo 4" className="w-16 h-16 ml-40" />
        </Marquee>
      </div>
    </>
  );
};

export default LogoGrid;
