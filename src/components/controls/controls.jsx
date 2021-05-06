import React from "react";
import Copy from "../copy/copy";
import styles from "./controls.module.css";

const Controls = ({ signalApp }) => {
  return (
    <div className={styles.container}>
      <ul className={styles.ul}>
        <Copy signalApp={signalApp}></Copy>
        <li>a</li>
        <li>b</li>
        <li>c</li>
      </ul>
    </div>
  );
};

export default Controls;
