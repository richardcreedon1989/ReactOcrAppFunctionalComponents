import React, { useState, useEffect } from "react";
import FileBase64 from "react-file-base64";
import {
  Form,
  FormGroup,
  Label,
  FormText,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  FormFeedback,
} from "reactstrap";
import axios from "axios";
import "./upload.css";

//Assistance - resubmit the old image again. Can only select new image/
//ToDo - Lambda retrun false if "" sent for names, Clean up hooks, Check extra digit validation, rename variables to be more clear (isFirstNamePresent) understand loop better/
//Explain why I did what

function Upload(props) {
  const [files, setFiles] = useState("");
  const [, setLambdaReturn] = useState("");
  const [ppsnPresent, setPpsnPresent] = useState(false);
  const [lastNamePresent, setLastNamePresent] = useState(false);
  const [firstNamePresent, setFirstNamePresent] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [dropDownValue, setDropDownValue] = useState("");
  const [invoiceUploaded, setInvoiceUploaded] = useState("Upload Document");
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [originalPpsn, setOriginalPpsn] = useState("");
  const [originalLastName, setOriginalLastName] = useState("");
  const [originalFirstName, setOriginalFirstName] = useState("");
  const [ppsnInvalidMessage, setPpsnInvalidMessage] = useState(false);
  const [formValues, setFormValues] = useState({
    ppsn: "",
    firstName: "",
    lastName: "",
  });

  const { ppsn, firstName, lastName } = formValues;

  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // PPSN VALIDATION
  const _onKeyUp = () => {
    // let ppsnRegex = /[0-9]{7}[A-Za-z]{1,2}$/g;

    function isPPSNValid(ppsn) {
      if (ppsn.length < 8 || ppsn.length > 9) {
        return false;
      }
      const checkChar = ppsn.charAt(7).toUpperCase();
      const checkNum = checkChar.charCodeAt(0) - 64;
      let sum = 0;
      for (let i = 2; i < 9; i++) {
        sum += parseInt(ppsn.charAt(8 - i)) * i;
      }
      return sum % 23 === checkNum;
    }

    function isPPSNValidNew(ppsn) {
      if (ppsn.length < 8 || ppsn.length > 9) {
        return false;
      }
      const checkChar = ppsn.charAt(7).toUpperCase();
      const checkNum = checkChar.charCodeAt(0) - 64;
      let sum = 0;
      for (let i = 2; i < 9; i++) {
        sum += parseInt(ppsn.charAt(8 - i)) * i;
      }
      const newCheckChar = ppsn.charAt(8).toUpperCase();
      const newCheckNum = newCheckChar.charCodeAt(0) - 64;
      sum += newCheckNum * 9;

      return sum % 23 === checkNum;
    }

    !isPPSNValidNew(ppsn) && !isPPSNValid(ppsn) && ppsn.length >= 8
      ? setPpsnInvalidMessage(true)
      : setPpsnInvalidMessage(false);

    isPPSNValidNew(ppsn) || isPPSNValid(ppsn) /* && ppsn.match(ppsnRegex */
      ? setDisabled(false)
      : setDisabled(true);
  };

  // DROPDOWN SELECTION
  const toggle = () => {
    dropDownOpen === false ? setDropDownOpen(true) : setDropDownOpen(false);
  };

  const selectDD = (e) => {
    setDropDownValue(e.currentTarget.textContent);
  };

  const dropDownMessage =
    dropDownValue !== "" ? dropDownValue : "Select Document Type";

  // API CALL TO AWS S3 & TEXTRACT

  const getFiles = async (files) => {
    setFiles(files);

    const UID = Math.round(1 + Math.random() * (1000000 - 1));
    const { ppsn, firstName, lastName } = formValues;
    let data = {
      fileExt: "png",
      imageID: UID,
      folder: UID,
      ppsn,
      firstName,
      lastName,
      img: files.base64,
    };

    await axios(
      "https://6velcmlhx7.execute-api.us-east-1.amazonaws.com/Production",
      {
        method: "POST",
        data,
      }
    )
      .then((res) => {
        console.log("s3", res);
        setInvoiceUploaded(
          `${dropDownValue !== "N/A" ? dropDownValue : "Document"} Uploaded`
        );
      })
      .catch((error) => {
        console.log(error);
      });

    axios(
      "https://6velcmlhx7.execute-api.us-east-1.amazonaws.com/Production/ocr",
      {
        method: "POST",
        data,
      }
    )
      .then((res) => {
        console.log("OCR", res);
        if (res.errorMessage) {
          alert(res.data.errorMessage);
          return;
        }

        const response = res.data.body;
        const returndedData = JSON.parse(res.config.data);

        setOriginalPpsn(returndedData.ppsn);
        setOriginalLastName(returndedData.lastName);
        setOriginalFirstName(returndedData.firstName);

        setLambdaReturn(response[0]);

        if (!data.errorMessage) {
          setOcrSuccess(true);
        }

        const { ppsn, firstName, lastName } = formValues;
        ppsn !== "" && setPpsnPresent(response[1]);
        firstName !== "" && setFirstNamePresent(response[2]);
        lastName !== "" && setLastNamePresent(response[3]);
        data = {
          fileExt: "png",
          imageID: UID,
          folder: UID,
          ppsn: "",
          firstName: "",
          lastName: "",
          img: "".base64,
        };

        setFiles("");
      })

      .catch((error) => {
        // console.log("errpr", error);
        // alert(err);
      });
  };

  //DISPLAYS PPSN/NAME MATCH RESULTS

  const ppsnMatchDisplayTrue =
    ppsnPresent && ocrSuccess && `PPSN: ${originalPpsn} - Matched`;

  const ppsnMatchDisplayFalse =
    ppsnPresent !== true &&
    ocrSuccess &&
    originalPpsn !== "" &&
    `PPSN: ${originalPpsn} - Not Matched`;

  const ppsnMatchDisplayEmpty =
    ocrSuccess && originalPpsn === "" && `PPSN Not Provided`;

  const lastNameMatchDisplayTrue =
    lastNamePresent &&
    ocrSuccess &&
    `Last Name: "${originalLastName}" - Matched`;

  const lastNameMatchDisplayFalse =
    lastNamePresent !== true &&
    ocrSuccess &&
    originalLastName !== "" &&
    `Last Name: "${originalLastName}" - Not Matched`;

  const lastNameMatchDisplayEmpty =
    ocrSuccess && originalLastName === "" && `Last Name Not Provided`;

  const firstNameMatchDisplayTrue =
    firstNamePresent &&
    ocrSuccess &&
    `First Name: "${originalFirstName}" - Matched`;

  const firstNameMatchDisplayFalse =
    firstNamePresent !== true &&
    ocrSuccess &&
    originalFirstName !== "" &&
    `First Name: "${originalFirstName}" - Not Matched`;

  const firstNameMatchDisplayEmpty =
    ocrSuccess && originalFirstName === "" && "First Name Not Provided";

  //LOADING MESSAGES
  const searchingDocumentMessage =
    invoiceUploaded === `${dropDownValue} Uploaded` &&
    ocrSuccess === false &&
    "Searching Document";

  const uploadDocumentMessage =
    dropDownValue !== "N/A" || "" ? dropDownValue : "file";

  useEffect(() => {
    if (ocrSuccess) {
      setFormValues({ ppsn: "", firstName: "", lastNamePresent: "" });
    }
  }, [ocrSuccess, files]);

  return (
    <div className="container" style={styles.marginTop10}>
      <div className="mt-3">
        <div>
          <Form>
            <FormGroup>
              <Label for="ppsn" style={styles.marginTop10}>
                <h5 style={styles.boiText}>
                  {" "}
                  PPSN <span style={{ color: "red" }}> * </span>
                </h5>
                <Input
                  valid
                  style={styles.width300}
                  type="text"
                  name="ppsn"
                  id="ppsn"
                  placeholder="(e.g. 1234567P)"
                  onChange={handleChange}
                  onKeyUp={_onKeyUp}
                  value={ppsn || ""}
                />

                {ppsnInvalidMessage ? (
                  <FormFeedback className="text-danger">
                    Invalid PPSN
                  </FormFeedback>
                ) : (
                  <FormFeedback></FormFeedback>
                )}
              </Label>
            </FormGroup>

            <FormGroup>
              <Label for="lastName">
                <h5 style={styles.boiText}> LAST NAME</h5>
                <Input
                  style={styles.width300}
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="(Bloggs)"
                  onChange={handleChange}
                  disabled={disabled}
                  value={lastName || ""}
                />
              </Label>
            </FormGroup>
            <FormGroup>
              <Label for="firstName">
                <h5 style={styles.boiText}> FIRST NAME </h5>
                <Input
                  style={styles.width300}
                  type="text"
                  name="firstName"
                  id="firstName"
                  placeholder="(Joe)"
                  onChange={handleChange}
                  disabled={disabled}
                  value={firstName || ""}
                />
              </Label>
            </FormGroup>

            <Dropdown isOpen={dropDownOpen} toggle={toggle}>
              <DropdownToggle style={styles.boiButton} caret>
                {dropDownMessage}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>
                  P60/Payslip/Revenue Letter/Social Welfare
                </DropdownItem>
                <DropdownItem onClick={selectDD} style={styles.boiButton}>
                  P60
                </DropdownItem>
                <DropdownItem onClick={selectDD} style={styles.boiButton}>
                  Payslip
                </DropdownItem>

                <DropdownItem onClick={selectDD} style={styles.boiButton}>
                  Revenue Document
                </DropdownItem>
                <DropdownItem onClick={selectDD} style={styles.boiButton}>
                  Social Welfare Letter
                </DropdownItem>
                <DropdownItem onClick={selectDD} style={styles.boiButton}>
                  N/A
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <FormGroup>
              <h4 style={styles.boiText}> {invoiceUploaded}</h4>
              <h4 className="text-danger">{searchingDocumentMessage}</h4>
              <FormText color="muted"> PNG, JPG </FormText> <br />
              <br />
              <div className="width upload-btn-wrapper ">
                <button className="btn width">
                  Upload {uploadDocumentMessage}
                </button>
                <FileBase64 className="width" mulitple={true} onDone={getFiles}>
                  {" "}
                </FileBase64>
              </div>
            </FormGroup>

            <div style={styles.boiText}>
              {ppsnMatchDisplayTrue}
              {ppsnMatchDisplayFalse}
              {ppsnMatchDisplayEmpty} <br />
              {lastNameMatchDisplayTrue}
              {lastNameMatchDisplayFalse}
              {lastNameMatchDisplayEmpty} <br />
              {firstNameMatchDisplayEmpty}
              {firstNameMatchDisplayFalse}
              {firstNameMatchDisplayTrue}
              <br />
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  marginTop10: {
    marginTop: "10px",
  },
  boiText: {
    color: "#444444",
    fontFamily: "Open-Sans,sans serif",
    fontWeight: "600",
  },
  width300: {
    width: "300px",
  },
  boiButton: {
    backgroundColor: "#106988",
    color: "white",
  },
};

export default Upload;
