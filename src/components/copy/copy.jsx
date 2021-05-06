import React from "react";
import styles from "./copy.module.css";

const Copy = ({ signalApp }) => {
  const onClick = () => {
    let dummy = document.createElement("input");
    const text = signalApp.currentLocation;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    console.log("copied!");
  };

  return (
    <div className={styles.container}>
      <button onClick={onClick} className={styles.button}>
        복사하기
      </button>
    </div>
  );
};

export default Copy;
