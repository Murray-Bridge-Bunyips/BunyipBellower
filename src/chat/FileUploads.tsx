/**
 *    Module to handle uploading files to Firebase storage and having a corresponding popup window to do so.
 *    @author Lucas Bubner, 2023
 */

import { ChangeEventHandler, ClipboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { auth, storage, uploadFileMsg, getData, toCommas } from "../Firebase";
import { getDownloadURL, ref, uploadBytesResumable, UploadTask, UploadTaskSnapshot } from "firebase/storage";
import Popup from "reactjs-popup";
import * as nsfwjs from "nsfwjs";
import { PopupActions } from "reactjs-popup/dist/types";
import "../css/FileUploads.css";
import "../css/CommonPopup.css";

function FileUploads() {
    const [tf, setTf] = useState<nsfwjs.NSFWJS>();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isFilePicked, setIsFilePicked] = useState(false);
    const [progressPercent, setProgressPercent] = useState(0);
    const [isFileUploading, setIsFileUploading] = useState(false);
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [isClipboard, setIsClipboard] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);
    const [scanNotice, setScanNotice] = useState(false);
    useEffect(() => {
        getData("users", toCommas(auth.currentUser?.email!)).then((data) => {
            setHasPermission(data?.upload);
        });
        // NSFWJS model is hosted externally, may break in the future
        // https://github.com/infinitered/nsfwjs
        nsfwjs.load().then((two) => setTf(two));
    }, []);

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

    async function scanMedia(file: File): Promise<object | true> {
        let scanTarget: HTMLImageElement | HTMLVideoElement | null = null;
        try {
            if (file.type.startsWith("image/")) {
                scanTarget = new Image();
                scanTarget.src = URL.createObjectURL(file);
                // TF requires a width and height to be set
                scanTarget.width = 1920;
                scanTarget.height = 1080;
            }

            if (file.type.startsWith("video/")) {
                // Must scan over every frame of the video
                scanTarget = document.createElement("video");
                scanTarget.src = URL.createObjectURL(file);
                scanTarget.width = 1920;
                scanTarget.height = 1080;
                scanTarget.muted = true;
                await scanTarget.play();
            }

            if (scanTarget) {
                let predictions: Array<Array<nsfwjs.predictionType>> = [];
                if (file.type === "image/gif") {
                    await tf?.classifyGif(scanTarget as HTMLImageElement).then((res) => (predictions = res));
                } else if (file.type.startsWith("video/")) {
                    scanTarget = scanTarget as HTMLVideoElement;
                    predictions = [];
                    // Scan every 10 milliseconds
                    for (let i = 0; i < scanTarget.duration * 100; i++) {
                        await tf?.classify(scanTarget).then((res) => predictions.push(res));
                    }
                } else {
                    await tf?.classify(scanTarget).then((res) => predictions.push(res));
                }

                for (let i = 0; i < predictions.length; i++) {
                    for (let j = 0; j < predictions[i].length; j++) {
                        // If any of the negative predictions are above 75%, reject the file
                        const { probability, className } = predictions[i][j];
                        if (probability > 0.75 && className !== "Neutral" && className !== "Drawing") {
                            console.debug(`Rejected file due to ${className} with probability ${probability}`);
                            return { className, probability };
                        }
                    }
                }
            }

            return true;
        } finally {
            scanTarget?.remove();
        }
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
        setScanNotice(false);
        setProgressPercent(0);
    };

    const uploadFile = (name: string) => {
        const storageRef = ref(storage, `files/${name}`);
        // prettier-ignore
        if (selectedFile)
            uploadTaskRef.current = uploadBytesResumable(storageRef, selectedFile);
    };

    const handleSubmission = async () => {
        if (!isFilePicked || !selectedFile || !hasPermission) return;
        setIsFileUploading(true);

        setScanNotice(true);
        setProgressPercent(100);
        // Convert the file into an image or video if applicable
        const scan = await scanMedia(selectedFile);
        if (scan instanceof Object) {
            if (!confirm("Your file has been rejected as the content has been flagged.\nIf you wish to bypass this, the content will not be visible and will held for an admin for review.")) {
                resetElement();
                return;
            }
        }
        setScanNotice(false);
        setProgressPercent(0);

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
                        uploadFileMsg(url, selectedFile.type, scan);
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
                    {hasPermission && (
                        <>
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
                                            {!scanNotice ? (
                                                <p>Uploading... {progressPercent}%</p>
                                            ) : (
                                                <p>
                                                    <i>Scanning file for inappropriate content... Please wait.</i>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {!hasPermission && (
                        <div className="ftext">
                            <i>You do not have permission to upload files.</i>
                        </div>
                    )}
                </div>
            </div>
        </Popup>
    );
}

export default FileUploads;
