import React from "react";
import "./upload.css";
const LoadingPage = () => {
  return (
    <div>
      <img
        style={{
          padding: "10px 0 0px 0",

          width: "100%",
        }}
        src={require("./loading.png")}
        alt="boi"
      />
      <img
        style={{
          padding: "0px 0 0px 0",

          width: "100%",
        }}
        src={require("./boiCar.png")}
        alt="boi"
      />
      <img
        style={{
          padding: "0px 0 10px 0",

          width: "100%",
        }}
        src={require("./boiCar2.png")}
        alt="boi"
      />
      {/* <h2 className="boiTextLoadingPage" style={{ textAlign: "center" }}>
        {" "}
        PPSN Validation{" "}
      </h2> */}

      <div style={{ textAlign: "center" }}>
        <button style={{ backgroundColor: "#f08a24" }} className="btn">
          {" "}
          <a
            style={{ backgroundColor: "#f08a24" }}
            className="btn"
            href="/Upload"
          >
            {" "}
            Proceed with application{" "}
          </a>{" "}
        </button>{" "}
        <div style={{ maxWidth: "60%", margin: "0 auto" }}>
          <p className="boiParagraphLandingPage">
            {" "}
            <br /> This will mean that we require you to provide a document that
            contains your Personal Public Service Number (PPSN) which will be
            checked against the Central Credit Registery
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
