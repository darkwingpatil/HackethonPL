/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import PropTypes from "prop-types";
import React from "react";
import { Placeholder } from "../../icons/Placeholder";
import "./style.css";
import{useNavigate,Outlet } from "react-router-dom"
const userHandle = "a48c4f3a-9a5e-4709-a438-4430f8c98e24"
export const PrimaryMediumIcon = ({
  className,
  icon = <Placeholder className="placeholder-instance" />,
  text = "Label",
  data
}) => {
  const Navigate=useNavigate()
  console.log(data,"logg the props")
  return (
    <div className={`primary-medium-icon ${className}`}>
      {icon}
      <div className="label" onClick={()=>{
        console.log(data,"for this is clicked")
        fetch("http://localhost:4000/settingContextPromptData",{
          "method":"POST",
          "headers":{
            "Content-Type": "application/json",
          },
          "body":JSON.stringify({courseId:data.CODELABID,userHandle})
        })
        Navigate(`/detail_page/${data.CODELABID}/${userHandle}/${data.CODELABTITLE}`)}}>{text}</div>
      <Outlet/>
    </div>
  );
};

PrimaryMediumIcon.propTypes = {
  text: PropTypes.string,
};
