import React from "react";
import { Labs } from "../../components/Labs";
import { PrimaryMediumIcon } from "../../components/PrimaryMediumIcon";
import { RatingStarBar } from "../../components/RatingStarBar";
import { StartCourse } from "../../icons/StartCourse";
import maskimage from '../../static/img/mask-group.png'
import { ListData } from "../../atoms/ListAtoms"
import { useRecoilState } from "recoil"
import InfiniteScroll from "react-infinite-scroll-component";
import "./style.css";

let limit = 10;
let offset = 0;
export const CodeLabList = () => {

  const [lablist, setLabList] = useRecoilState(ListData)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    fetch(`http://localhost:4000/codelablists`)
      .then((res) => res.json())
      .then(({ data }) => {
        setLabList(data);
        console.log(data);
      })
      .catch((err) => console.log(err));

    offset += limit; // Increment offset after fetching data
  };
  return (
    <div className="code-lab-list">
      <div className="div">
        <div className="title">
          <div className="text-wrapper">Code Labs</div>
        </div>
        <div className="text-wrapper-2">{lablist.length} Results</div>
        {
          lablist && lablist.length > 0 ?
            lablist.map((el, ind) => {
              return (
                <div key={ind} className="list" style={{ top: `${((ind + 1) * 100) * 2}px` }}>
                  <div className="overlap">
                    <div className="group">
                      <div className="overlap-group">
                        <div className="group-2">
                          <p className="p">{el.CODELABTITLE}</p>
                          <div className="text-wrapper-3">By Pluralsight Skills</div>
                          <div className="mask-group">
                            <div className="overlap-group-wrapper">
                              <div className="overlap-group-2">
                                <div className="rectangle" />
                                <img className="mask-group" alt="Mask group" src={maskimage} />
                                <div className="labs-wrapper">
                                  <Labs />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="frame">
                          <div className="text-wrapper-4">LAB</div>
                        </div>
                      </div>
                      <PrimaryMediumIcon
                        className="start-lab"
                        icon={<StartCourse className="start-course" />}
                        text="Start lab"
                        data={el}
                      />
                    </div>
                    <div className="level">
                      <div className="text-wrapper-5">Beginner</div>
                      <div className="ellipse" />
                      <div className="frame-2">
                        <RatingStarBar
                          className="rating-star-bar-4-0"
                          resourcesIconDivClassName="rating-star-bar-2"
                          resourcesIconDivClassNameOverride="rating-star-bar-3"
                          resourcesIconRatingStarEmptyStyleOverrideClassName="rating-star-bar-instance"
                          resourcesIconResourcesIconClassName="rating-star-bar-4-0-instance"
                          resourcesIconResourcesIconClassNameOverride="design-component-instance-node"
                        />
                        <div className="text-wrapper-5">{((Math.floor(Math.random() * (5000 - 200 + 1)) + 200))}</div>
                      </div>
                      <div className="ellipse" />
                      <div className="text-wrapper-5">{Math.round((Math.floor(Math.random() * (5000 - 200 + 1)) + 200) / 60)} h</div>
                    </div>
                  </div>
                </div>
              )
            }) : ""
        }
      </div>
    </div>
  )
};


