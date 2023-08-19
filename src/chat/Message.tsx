/**
 *    Template module for message and file rendering.
 *    Generates a div with message or file content for each message in Firebase.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { useMemo, useState } from "react";
import { auth, MessageData } from "../Firebase";
import Msgman from "./Msgman";
import "../css/App.css";
import "../css/Message.css";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import Filter from "bad-words";

const getFileFormat = (fileURL: string) => {
    return fileURL.slice(0, fileURL.indexOf(":"));
};

export const getFileURL = (fileURL: string) => {
    return fileURL.slice(fileURL.indexOf(":") + 1);
};

const filter = new Filter({ placeHolder: "♥" });

function Message(props: { message: MessageData; key: string }) {
    const { message } = props;
    const [isHovering, setIsHovering] = useState(false);
    const handleMouseOver = () => setIsHovering(true);
    const handleMouseOut = () => setIsHovering(false);

    const messageText = useMemo(() => {
        // Check localstorage for the user's profanity filter preference
        const filterPref = localStorage.getItem("filter");
        if (filterPref === "false") return message.text;
        try {
            return filter.clean(message.text);
        } catch (e) {
            return "*<filtered>*";
        }
    }, [message.text]);

    let timestamp;
    try {
        // Try to receive a timestamp from the server
        timestamp = new Date(message.createdAt);
    } catch (e) {
        // In cases where the user is the message sender, we might not be able to get the server timestamp
        // and it will throw an error. In this case, we can just use the local user time as it won't matter too much.
        timestamp = new Date(Date.now());
    }

    return (
        // Determine whether the message was sent or received by checking the author and current user
        <div
            className={`message ${auth.currentUser?.uid === message.uid ? "sent" : "received"}${message.photoURL === "sys" ? " sys" : ""}`}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            {/* Generate profile picture based on the photoURL attached with the message */}
            {message.photoURL !== "sys" && (
                <img
                    className="pfp"
                    src={message.photoURL}
                    onError={() => {
                        (document.getElementsByClassName("pfp")[0] as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDI4OCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODgiIGhlaWdodD0iMjg4IiBmaWxsPSIjRTlFOUU5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIyIDEwOUMyMjIgMTM5LjM2NiAyMDQuNjQ3IDE2NS42OCAxNzkuMzE3IDE3OC41NjVDMjIzLjk4MSAxODcuNzE4IDI2Mi40NDMgMjEzLjg4NiAyODcuNjMzIDI1MEgyODhWMjg4SDBWMjUwSDAuMzY3MTg4QzI1LjU1NzQgMjEzLjg4NiA2NC4wMTkzIDE4Ny43MTggMTA4LjY4MyAxNzguNTY1QzgzLjM1MjggMTY1LjY4IDY2IDEzOS4zNjYgNjYgMTA5QzY2IDY1LjkyMTkgMTAwLjkyMiAzMSAxNDQgMzFDMTg3LjA3OCAzMSAyMjIgNjUuOTIxOSAyMjIgMTA5WiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K";
                    }}
                    alt={`Profile of ${message.displayName}`}
                    referrerPolicy="no-referrer"
                />
            )}
            <div className="namedate">
                <p className="name">
                    <b>{message.displayName}</b>
                </p>

                {/* Display the proper formatted date and time metadata with each message */}
                {message.photoURL !== "sys" && (
                    <p className="date">{timestamp.toLocaleString("en-AU", { hour12: true })}</p>
                )}
            </div>

            {/* If the message is declared as retracted, do not display the message content whatsoever. */}
            {!message.isRetracted ? (
                message.isMsg ? (
                    // If it is a normal message, pass it through ReactMarkdown which will auto hyperlink any links, and add markdown
                    // Ensure to not pass through markdown if the message is a system message
                    message.photoURL !== "sys" ? (
                        !message.autoMod ? (
                            <ReactMarkdown className="text" remarkPlugins={[gfm]} linkTarget="_blank">
                                {messageText}
                            </ReactMarkdown>
                        ) : (
                            <p className="text"><strong>(MESSAGE AUTOMODDED)</strong> {messageText}</p>
                        )
                    ) : (
                        <p className="text">{messageText}</p>
                    )
                    // TODO: Admin review automod system, flagging is up and running but we need to implement a system to handle them better than just saying (MESSAGE AUTOMODDED)
                ) : (
                    // Otherwise, it must be a file and we can display the downloadURL depending on it's type
                    // The type for the URL is prepended to the downloadURL with a colon
                    <div className="file">
                        {/* Use file format to determine if we can outright display the downloadURL in an img, video, etc. tag */}
                        {getFileFormat(message.text).startsWith("image") ? (
                            // If we can display the image through an img tag, define a height maximum and render it
                            <img
                                onClick={() => window.open(getFileURL(message.text), "_blank")}
                                src={getFileURL(message.text)}
                                alt={`Upload by ${message.displayName}`}
                                className="fileimage"
                            />
                        ) : getFileFormat(message.text).startsWith("video") ? (
                            // Swapped to using a video tag instead of an iframe, it seems to work now...
                            // prettier-ignore
                            <video
                                controls
                                src={getFileURL(message.text)}
                                className="filevideo"
                            />
                        ) : getFileFormat(message.text).startsWith("audio") ? (
                            // Display an audio file as an audio element if we can.
                            <audio
                                controls
                                src={getFileURL(message.text)}
                                autoPlay={false}
                                title={`Audio upload by ${message.displayName}`}
                                className="fileaudio"
                            />
                        ) : (
                            // Fallback view file attachment to each file upload incase of an unknown file type
                            // prettier-ignore
                            <a target="_blank" rel="noreferrer" href={getFileURL(message.text)}>
                                <b>
                                    View {getFileFormat(message.text) || "unknown"} file uploaded
                                    by {message.displayName}
                                </b>
                            </a>
                        )}
                    </div>
                )
            ) : (
                <p className="text">
                    <i>&lt;message deleted&gt;</i>
                </p>
            )}
            {message.photoURL !== "sys" && <Msgman id={message.id} isActive={isHovering} />}
        </div>
    );
}

export default Message;
