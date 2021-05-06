import React, { useState } from "react";
import Video from "../video/video";
import styles from "./videoRoom.module.css";

const VideoRoom = ({ signalApp, btn }) => {
  const click = () => {
    btn();
  };
  return (
    <div className={styles.container}>
      <ul>
        {Object.entries(signalApp.participants).map((participant) => {
          return (
            <>
              <Video
                keys={participant[1].id}
                participant={participant}
                btn={btn}
              ></Video>
              <h3>{participant[1].id}</h3>
              <button onClick={click}>click</button>
            </>
          );
        })}
      </ul>
    </div>
  );
};

export default VideoRoom;
