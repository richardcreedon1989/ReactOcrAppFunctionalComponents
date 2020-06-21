import React from "react";
import { Button } from "reactstrap";

const Navbar = () => {
  return (
    <div>
      {" "}
      <Button style={{ color: "white" }}>
        {" "}
        <a href="/upload"> Continue </a>{" "}
      </Button>
    </div>
  );
};

export default Navbar;
