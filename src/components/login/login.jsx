import React, { useRef } from "react";
import styles from "./login.module.css";

const Login = ({ onBtnClick }) => {
  const inputRef = useRef();
  const onSubmit = () => {
    onBtnClick(inputRef.current.value);
    inputRef.current.value = "";
  };

  const onKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };
  return (
    <div className={styles.container}>
      <input
        onKeyPress={onKeyPress}
        className={styles.input}
        ref={inputRef}
        placeholder="이름을 입력해주십시오..."
      ></input>
      <button className={styles.button} onClick={onSubmit}>
        Login
      </button>
    </div>
  );
};

export default Login;
