/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import { ResourcesIconRatingStarEmpty } from "../../icons/ResourcesIconRatingStarEmpty";
import { ResourcesIcon } from "../ResourcesIcon";
import "./style.css";

export const RatingStarBar = ({
  className,
  resourcesIconRatingStarEmptyStyleOverrideClassName,
  resourcesIconResourcesIconClassName,
  resourcesIconResourcesIconClassNameOverride,
  resourcesIconDivClassName,
  resourcesIconDivClassNameOverride,
}) => {
  return (
    <div className={`rating-star-bar ${className}`}>
      <ResourcesIconRatingStarEmpty
        className={resourcesIconRatingStarEmptyStyleOverrideClassName}
        color="#8A99A8"
        opacity="0.25"
      />
      <ResourcesIcon className={resourcesIconResourcesIconClassName} />
      <ResourcesIcon className={resourcesIconResourcesIconClassNameOverride} />
      <ResourcesIcon className={resourcesIconDivClassName} />
      <ResourcesIcon className={resourcesIconDivClassNameOverride} />
    </div>
  );
};
