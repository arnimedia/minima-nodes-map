import React from "react";
import LogoDark2x from "../images/minima_logo.svg";

const SideSlide = () => {
  return (
    <>
        <div className="slide-side">
            <div className="logo">
                <img className="logo-dark logo-img" src={LogoDark2x} alt="logo" />
            </div>
            <div className="info-box">
               80,000 registered nodes
            </div>
        </div>
    </>
  );
};

export default SideSlide;