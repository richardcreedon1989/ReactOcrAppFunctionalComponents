import React, { useState, useEffect } from "react";
import FileBase64 from "react-file-base64";
import {
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    FormFeedback,
    CustomInput
} from "reactstrap";
import axios from "axios";
import "./upload.css";
import {
    isPPSNValid,
    isPPSNValidNew
} from './ppsnValidator'

//Assistance - resubmit the old image again. Can only select new image/
//ToDo - Lambda retrun false if "" sent for names, Clean up hooks, Check extra digit validation, rename variables to be more clear (isFirstNamePresent) understand loop better/
//Explain why I did what

function Upload(props) {
    const [files, setFiles] = useState("");
    const [, setLambdaReturn] = useState("");
    const [ppsnPresent, setPpsnPresent] = useState(false);
    const [lastNamePresent, setLastNamePresent] = useState(false);
    const [firstNamePresent, setFirstNamePresent] = useState(false);

    const [checkBox, setCheckBox] = useState("");
    // const [invoiceUploaded, setInvoiceUploaded] = useState("Upload Document");
    const [ocrSuccess, setOcrSuccess] = useState(false);
    const [originalPpsn, setOriginalPpsn] = useState("");
    const [originalLastName, setOriginalLastName] = useState("");
    const [originalFirstName, setOriginalFirstName] = useState("");
    const [ppsnInvalid, setPpsnInvalid] = useState(true);
    const [completeMatch, setCompleteMatch] = useState(false);
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

    const checkBoxHandler = (e) => {
        e.preventDefault();
        setCheckBox(e.target.value);
    };

    // PPSN VALIDATION
    const onPPSNInputChange = (e) => {
        const value = e.target.value;
        setPpsnInvalid(!isPPSNValidNew(value) && !isPPSNValid(value))
        setFormValues({ ...formValues, ppsn: value });
    };

    // API CALL TO AWS S3 & TEXTRACT

    const getFiles = async (files) => {
        setFiles(files);
        const { ppsn, firstName, lastName } = formValues;
        const UID = Math.round(1 + Math.random() * (1000000 - 1));

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
                // setInvoiceUploaded(
                //   `${checkBox !== "Other" || "" ? checkBox : "Document"} Uploaded`
                // );
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

                returndedData.lastName === undefined
                    ? setOriginalLastName("")
                    : setOriginalLastName(returndedData.lastName);

                setOriginalFirstName(returndedData.firstName);

                setLambdaReturn(response[0]);

                if (!data.errorMessage) {
                    setOcrSuccess(true);
                }

                const { ppsn, firstName, lastName } = formValues;
                ppsn !== "" && setPpsnPresent(response[1]);
                firstName !== "" && setFirstNamePresent(response[2]);
                lastName !== "" && setLastNamePresent(response[3]);

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

    useEffect(() => {
        if (ocrSuccess) {
            setFormValues({ ppsn: "", firstName: "", lastNamePresent: "" });
        }
        ppsnMatchDisplayTrue &&
            lastNameMatchDisplayTrue &&
            firstNameMatchDisplayTrue
            ? setCompleteMatch(true)
            : setCompleteMatch(false);
    }, [
        ocrSuccess,
        firstNameMatchDisplayTrue,
        lastNameMatchDisplayTrue,
        ppsnMatchDisplayTrue,
    ]);

    return (
        <Container>
            <Row className="mt-3">
                <Col>
                    <img
                        style={{
                            padding: "10px 0 0px 0",

                            width: "100%",
                        }}
                        src={require("./loading.png")}
                        alt="boi"
                    />

                </Col>

            </Row>

            <Row>
                <Col></Col>
                <Col sm={6}>

                    <Form>
                        <FormGroup >
                            <Label
                                style={{ marginTop: "2px", marginBottom: "2px" }}
                                for="ppsn"
                                className="marginTop10"
                            >
                                <h5 className="boiText">
                                    Personal Public Service Number
                                    <span style={{ color: "red" }}> * </span>
                                </h5>
                            </Label>

                            <Input
                                style={{ marginTop: "2px", marginBottom: "2px" }}
                                type="text"
                                name="ppsn"
                                id="ppsn"
                                placeholder="(e.g. 1234567P)"
                                onChange={onPPSNInputChange}
                                value={formValues.ppsn}
                            />

                            {ppsn !== "" && ppsnInvalid &&
                                <FormFeedback className="text-danger">
                                    Please enter valid PPSN
                                </FormFeedback>

                            }
                        </FormGroup>
                        <FormGroup>
                            <Label
                                style={{ marginTop: "-18px", marginBottom: "2px" }}
                                for="lastName"
                            >
                                <h5 className="boiText"> Last Name</h5>
                            </Label>
                            <Input
                                style={{ marginTop: "2px", marginBottom: "2px" }}
                                type="text"
                                name="lastName"
                                id="lastName"
                                placeholder="(Bloggs)"
                                onChange={handleChange}
                                disabled={ppsnInvalid}
                                value={lastName || ""}
                            />

                        </FormGroup>
                        <FormGroup>
                            <Label
                                style={{ marginTop: "-18px", marginBottom: "2px" }}
                                for="firstName"
                            >
                                <h5 className="boiText"> First Name </h5>

                            </Label>
                            <Input
                                style={{ marginTop: "2px", marginBottom: "0px" }}
                                type="text"
                                name="firstName"
                                id="firstName"
                                placeholder="(Joe)"
                                onChange={handleChange}
                                disabled={ppsnInvalid}
                                value={firstName || ""}
                            />

                        </FormGroup>

                        <h4
                            className="boiText"
                            style={{ marginBottom: "5px", marginTop: "20px" }}
                        >
                            {" "}
              Document Type{" "}
                        </h4>
                        <FormGroup
                            style={{
                                marginRight: "5px",
                                marginTop: "0px",
                                marginBottom: "0px",
                            }}
                        >
                            <CustomInput
                                style={{
                                    marginRight: "5px",
                                    marginTop: "0px",
                                    marginBottom: "0px",
                                }}
                                className="boiText"
                                type="radio"
                                value="P60"
                                id="p60"
                                name="P60"
                                onChange={checkBoxHandler}
                                checked={checkBox === "P60"}
                                label={<span className="boiTextInput"> P60 </span>}
                            />
                            <CustomInput
                                className="boiText"
                                style={{
                                    marginRight: "5px",
                                    marginTop: "0px",
                                    marginBottom: "0px",
                                }}
                                type="radio"
                                id="payslip"
                                value="Payslip"
                                name="Payslip"
                                onChange={checkBoxHandler}
                                checked={checkBox === "Payslip"}
                                label={<span className="boiTextInput"> Payslip </span>}
                            />

                            <CustomInput
                                type="radio"
                                className="boiText"
                                style={{
                                    marginRight: "5px",
                                    marginTop: "0px",
                                    marginBottom: "0px",
                                }}
                                id="socialWelfareDocument"
                                name="Social Welfare Document"
                                value="Social Welfare Document"
                                label={
                                    <span className="boiTextInput">
                                        {" "}
                    Social Welfare Document{" "}
                                    </span>
                                }
                                onChange={checkBoxHandler}
                                checked={checkBox === "Social Welfare Document"}
                            />
                            <CustomInput
                                type="radio"
                                className="boiText"
                                style={{
                                    marginRight: "5px",
                                    marginTop: "0px",
                                    marginBottom: "0px",
                                }}
                                id="other"
                                name="other"
                                value="Other"
                                label={<span className="boiTextInput"> Other </span>}
                                onChange={checkBoxHandler}
                                checked={checkBox === "Other"}
                            />
                        </FormGroup>
                        <FormGroup>
                            {/* <h4 className="boiText"> {invoiceUploaded}</h4>
              <h4 className="text-danger">{searchingDocumentMessage}</h4> */}
                            <br />

                            {!completeMatch &&
                                <div className="width upload-btn-wrapper ">
                                    <button className="btn width">Upload</button>
                                    <FileBase64 className="width" mulitple={true} onDone={getFiles}>
                                        {" "}
                                    </FileBase64>
                                </div>
                            }

                        </FormGroup>

                        <div style={{ textAlign: "center"}}>
                            <div className="matchDisplayResultsPositive ">
                                {" "}
                                {ppsnMatchDisplayTrue}{" "}
                            </div>
                            <div className="matchDisplayResultsNegative">
                                {" "}
                                {ppsnMatchDisplayFalse}
                            </div>
                            <div className="matchDisplayResultsNegative">
                                {ppsnMatchDisplayEmpty}{" "}
                            </div>{" "}
                            <div className="matchDisplayResultsPositive ">
                                {" "}
                                {lastNameMatchDisplayTrue}
                            </div>
                            <div className="matchDisplayResultsNegative">
                                {" "}
                                {lastNameMatchDisplayFalse}
                            </div>
                            <div className="matchDisplayResultsNegative">
                                {" "}
                                {lastNameMatchDisplayEmpty}
                            </div>{" "}
                            <div className="matchDisplayResultsNegative ">
                                {" "}
                                {firstNameMatchDisplayEmpty}
                            </div>
                            <div className="matchDisplayResultsNegative">
                                {firstNameMatchDisplayFalse}
                            </div>
                            <div className="matchDisplayResultsPositive">
                                {firstNameMatchDisplayTrue}
                            </div>
                        </div>

                    </Form>
                </Col>
                <Col></Col>
            </Row>

            <Row style={{marginTop: "50px"}}>
                <Col></Col>
                <Col sm={6}>
                    {completeMatch &&
                        <a className="btn width" href="/Success">
                            Continue
                        </a>
                    }
                </Col>
                <Col></Col>
            </Row>
        </Container>
    );
}

export default Upload;
