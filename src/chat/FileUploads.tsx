/**
 *    Module to handle uploading files to Firebase storage and having a corresponding popup window to do so.
 *    @author Lucas Bubner, 2023
 */

import { ChangeEventHandler, ClipboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { storage, uploadFileMsg } from "../Firebase";
import { getDownloadURL, ref, uploadBytesResumable, UploadTask, UploadTaskSnapshot } from "firebase/storage";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import "../css/FileUploads.css";
import "../css/CommonPopup.css";

function FileUploads() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [isClipboard, setIsClipboard] = useState(false);

    const uploadTaskRef = useRef<UploadTask>();

    // Return 8 characters that are legal for making file names unique
    const generateChars = () => [...Array(8)].map(() => Math.random().toString(36).substring(2, 3)).join("");

    // Convert byte numbers to their corresponding format
    const formatBytes = (a: number, b = 2) => {
        const c = Math.max(0, b);
        const d = Math.floor(Math.log(a) / Math.log(1024));
        return `${parseFloat((a / Math.pow(1024, d)).toFixed(c))} ${
            ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
        }`;
    };

    function generateUniqueFileName(filename: string) {
        // <original filename> + _ + <random 8 chars> + <file extension>
        return (
            filename.substring(0, filename.lastIndexOf(".")) +
            "_" +
            generateChars() +
            filename.slice(filename.lastIndexOf(".") - 1)
        );
    }

    const changeHandler: ChangeEventHandler<HTMLInputElement> = (event) => {
        if (!event.target.files) return;
        setSelectedFile(event.target.files[0]);

        // If the file is greater than 10 megabytes, restrict upload
        if (event.target.files[0].size > 10000000) {
            alert(`File size exceeds the limit of 10 MB. Your file is ${formatBytes(event.target.files[0].size)}.`);
            setIsFilePicked(false);
            return;
        }

        setIsFilePicked(true);
    };

    const resetElement = () => {
        if (uploadTaskRef.current && "cancel" in uploadTaskRef.current) {
            uploadTaskRef.current.cancel();
        }
        setIsFileUploading(false);
        setIsFilePicked(false);
        setIsFileUploaded(false);
        setIsClipboard(false);
    };

    const uploadFile = (name: string) => {
        const storageRef = ref(storage, `files/${name}`);
        // prettier-ignore
        if (selectedFile)
            uploadTaskRef.current = uploadBytesResumable(storageRef, selectedFile);
    };

    const handleSubmission = () => {
        if (!isFilePicked || !selectedFile) return;
        setIsFileUploading(true);

        // Generate a random string of characters to supplement the file name to avoid duplicates
        const fileName = generateUniqueFileName(selectedFile.name);

        // Upload the file to Firebase Storage
        uploadFile(fileName);

        uploadTaskRef.current?.on(
            "state_changed",
            (snapshot: UploadTaskSnapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                setProgressPercent(progress);
            },
            (error) => {
                alert(error);
            },
            () => {
                // Handle uploading the file URL into a message doc
                getDownloadURL(ref(storage, `files/${fileName}`))
                    .then((url) => {
                        uploadFileMsg(url, selectedFile.type);
                    })
                    .catch((error) => {
                        console.error(error);
                        alert(
                            "Something went wrong adding your file to the messages database. This error has been logged to the console."
                        );
                    });
                setIsFileUploaded(true);
            }
        );
    };

    const clipboardHandler = useCallback((ev: ClipboardEvent | Event) => {
        const e = ev as ClipboardEvent;
        console.debug("Pasted clipboard content at target:", e.target);

        // Only activate if the target was towards the chat box to avoid goofy interface issues
        if (e.target instanceof HTMLElement && e.target.className !== "msginput") return;

        // Intercept the paste event contents
        const clip = e.clipboardData.items;

        // Check if any of the clipboard items are files
        for (let i = 0; i < clip.length; i++) {
            if (clip[i].kind === "file") {
                setSelectedFile(clip[i].getAsFile());
                setIsClipboard(true);
                setIsFilePicked(true);
                break;
            }
        }
    }, []);

    useEffect(() => {
        if (isClipboard && selectedFile) {
            // Open popup window and supply file information after a paste operation
            tref.current?.open();
        }
    }, [isClipboard, selectedFile, isFilePicked]);

    // Prevent attaching multiple listeners to the paste event
    useEffect(() => {
        const pasteListener = clipboardHandler;
        window.addEventListener("paste", pasteListener);

        return () => {
            window.removeEventListener("paste", pasteListener);
        };
    }, [clipboardHandler]);

    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();

    return (
        <Popup ref={tref} trigger={<span className="popupbutton" />} onClose={resetElement}>
            <div className="uploadWindow outer">
                <div className="innerUploadWindow inner">
                    <span className="close" onClick={tclose}>
                        &times;
                    </span>
                    <h3 className="ftitle">File Upload Menu</h3>
                    {isFileUploaded ? (
                        <div className="ftext">File uploaded.</div>
                    ) : !isClipboard ? (
                        <input type="file" name="file" onChange={changeHandler} className="fileInput" />
                    ) : (
                        <div className="ftext">
                            <i>File supplied by message box clipboard paste.</i>
                        </div>
                    )}
                    {isFilePicked && selectedFile != null && !isFileUploaded && (
                        <div className="fileinfo">
                            <br />
                            <p>
                                <i>File name:</i> {selectedFile.name} <br />
                                <i>Filetype:</i> {selectedFile.type || "unknown"} <br />
                                <i>Size in bytes:</i> {formatBytes(selectedFile.size)}
                            </p>
                            <p>
                                <b>Upload file?</b>
                            </p>
                            <div>
                                <button className="uploadButton" onClick={handleSubmission}>
                                    Upload
                                </button>
                            </div>
                        </div>
                    )}
                    <br />
                    {isFileUploading && !isFileUploaded && (
                        <div className="barload">
                            <div className="outerload">
                                <div
                                    className="innerload"
                                    style={{
                                        width: `${progressPercent}%`,
                                    }}
                                >
                                    <p>Uploading... {progressPercent}%</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Popup>
    );
}

export default FileUploads;
