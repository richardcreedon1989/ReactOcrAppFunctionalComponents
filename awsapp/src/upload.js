import React, { useState } from 'react';
import FileBase64 from 'react-file-base64';
import { Form, FormGroup, Button, Label, FormText, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap"
import axios from "axios";
import "./upload.css";


function Upload(props) {

    const [confirmation, setConfirmation] = useState("")
    const [, setFiles] = useState("")
    const [, setLambdaReturn] = useState("")
    const [ppsnPresent, setPpsnPresent] = useState(false)
    const [lastNamePresent, setLastNamePresent] = useState(false)
    const [firstNamePresent, setFirstNamePresent] = useState(false)
    const [disabled, setDisabled] = useState(true)
    const [dropDownOpen, setDropDownOpen] = useState(false)
    const [dropDownValue, setDropDownValue] = useState("")
    const [invoiceUploaded, setInvoiceUploaded] = useState("Upload Document")
    const [ocrSuccess, setOcrSuccess] = useState(false)
    const [formValues, setFormValues] = useState({ ppsn: "", firstName: "", lastName: "" })

    // const refreshPage = () => {
    //     window.location.reload();
    // }

    const handleChange = (e) => {
        e.preventDefault();
        const { name, value } = e.target
        setFormValues({ ...formValues, [name]: value })
    }

    const _onKeyUp = () => {
        let regex = /[0-9]{7}[A-Za-z]{1}$/g;
        formValues.ppsn.match(regex) ? setDisabled(false) : setDisabled(true)
    }

    const toggle = () => {
        dropDownOpen === false ? setDropDownOpen(true) : setDropDownOpen(false)
    }

    const selectDD = (e) => {
        setDropDownValue(e.currentTarget.textContent)
        console.log(dropDownValue)
    }

    const getFiles = async (files) => {
        setFiles(files)
        setConfirmation("Scanning")

        const UID = Math.round(1 + Math.random() * (1000000 - 1));
        const { ppsn, firstName, lastName } = formValues
        var data = {
            fileExt: "png",
            imageID: UID,
            folder: UID,
            ppsn,
            firstName,
            lastName,
            img: files.base64
        };

        await axios("https://6velcmlhx7.execute-api.us-east-1.amazonaws.com/Production", {
            method: "POST",
            data
        })
            .then(res => {
                console.log("s3", res)
                setInvoiceUploaded("Success: Document Uploaded")
            })
            .catch(error => {
                console.log(error)
            });

        axios("https://6velcmlhx7.execute-api.us-east-1.amazonaws.com/Production/ocr", {

            method: "POST",
            data,
        })
            .then(res => {
                console.log("OCR", res)
                const response = res.data.body
                setLambdaReturn(response[0])
                setOcrSuccess(true)
                const { ppsn, firstName, lastName } = formValues
                ppsn !== "" && setPpsnPresent(response[1])
                firstName !== "" && setFirstNamePresent(response[2])
                lastName !== "" && setLastNamePresent(response[3])
            })

            .catch(error => {
                console.log(error)
                alert("Please refresh the browser and try again")
            });
        setConfirmation("")
    }

    return (
        <div className="container" style={marginTop10}>
            <div className="mt-3" >
                <div >
                    <Form  >
                        <FormGroup>
                            <Label for="ppsn" style={marginTop10}>
                                <h5 style={boiText}> PPSN <span style={{ color: "red" }} > * </span></h5>
                                <Input
                                    style={{ width: "300px" }}
                                    type="text"
                                    name="ppsn"
                                    id="ppsn"
                                    placeholder="(e.g. 1234567P)"
                                    onChange={handleChange}
                                    onKeyUp={_onKeyUp}
                                />

                            </Label>
                        </FormGroup>

                        <FormGroup>
                            <Label for="lastName">
                                <h5 style={boiText}> LAST NAME</h5>
                                <Input
                                    style={{ width: "300px" }}
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    placeholder="(Bloggs)"
                                    onChange={handleChange}
                                    disabled={disabled}

                                />

                            </Label>
                        </FormGroup>
                        <FormGroup>
                            <Label for="firstName">
                                <h5 style={boiText}> FIRST NAME </h5>
                                <Input
                                    style={{ width: "300px" }}
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    placeholder="(Joe)"
                                    onChange={handleChange}
                                    disabled={disabled}

                                />
                            </Label>
                        </FormGroup>

                        <Dropdown isOpen={dropDownOpen} toggle={toggle}>
                            <DropdownToggle style={boiButton} caret>

                                {dropDownValue !== "" ? dropDownValue : "Select Document Type"}

                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem header>P60/Payslip/Revenue Letter/Social Welfare</DropdownItem>
                                <DropdownItem onClick={selectDD} style={boiButton}>P60</DropdownItem>
                                <DropdownItem onClick={selectDD} style={boiButton}>Payslip</DropdownItem>

                                <DropdownItem onClick={selectDD} style={boiButton}>Revenue Document</DropdownItem>
                                <DropdownItem onClick={selectDD} style={boiButton}>Social Welfare Letter</DropdownItem>
                                <DropdownItem onClick={selectDD} style={boiButton}>N/A</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>

                        <FormGroup>
                            <h3 className="text-danger"> {confirmation} </h3>
                            <h4 style={boiText}> {invoiceUploaded}  </h4>
                            <FormText color="muted"> PNG, JPG </FormText> <br /><br />
                            <div style={{ width: "100%" }} className="upload-btn-wrapper">
                                <button className="btn width" >Upload {dropDownValue !== "N/A" ? dropDownValue : "file"}</button>
                                <FileBase64 style={{ width: "100%" }} mulitple={true}
                                    onDone={getFiles}> </FileBase64>
                            </div>
                        </FormGroup>

                        <div style={boiText} >
                            PPSN Matched: <span style={{ color: "green" }} > {ppsnPresent ? "PPSN Matched: True" : "No Match "} </span> <br />

                            {ocrSuccess && ppsnPresent ? "PPSN Matched: True" : "No Match"
                            }
                            {/* {ppsnPresent ? "PPSN Matched: True" : "No Match"} br /> */}
                            Last Name Matched: {lastNamePresent ? "True" : ""} <br />
                            First Name Matched: {firstNamePresent ? "True" : ""} <br />
                            Document Type: {dropDownValue ? dropDownValue : ""}
                        </div>

                    </Form>
                </div>
            </div >
        </div >
    );

}

const marginTop10 = { marginTop: "10px" };
const boiButton = { backgroundColor: "#106988", color: "white" }
// const boiColor = { color: "#0085b0" }
const boiText = { color: "#444444", fontFamily: "Open-Sans,sans serif", fontWeight: "600" }
// const boiOutline = { borderColor: "#0085b0" }
export default Upload;