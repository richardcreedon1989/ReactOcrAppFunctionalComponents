import React from "react";
const Success = () => {
  return (
    <div>
      <br />
      <img
        style={{
          padding: "10px 0 0px 0",

          width: "100%",
        }}
        src={require("./loading.png")}
        alt="boi"
      />
      <br />
      <br />
      <br />
      <br />
      <br />
      <p
        style={{ textAlign: "center", fontWeight: "800", fontSize: "20px" }}
        className="boiText"
      >
        {" "}
        User Continues On Journey
      </p>
    </div>
  );
};

export default Success;
