import React, { useEffect, useRef } from "react";
import styles from "./video.module.css";

const Video = ({ keys, participant, btn }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    videoRef.current.srcObject =
      participant[1].type === "local"
        ? participant[1].rtcPeer.getLocalStream()
        : participant[1].rtcPeer.getRemoteStream();
  }, [btn]);

  return (
    <div className={styles.container}>
      <li className={styles.li} key={keys}>
        <video className={styles.video} ref={videoRef} autoPlay></video>
      </li>
    </div>
  );
};

export default Video;
