/**
 *    Template module for message and file rendering.
 *    Generates a div with message or file content for each message in Firebase.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import { useMemo, useState } from "react";
import { auth, MessageData, updateMsg } from "../Firebase";
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
const customWords = localStorage.getItem("filterlist");
if (customWords) filter.addWords(...JSON.parse(customWords));

function Message(props: { isAdmin: boolean; shouldGroup: boolean; message: MessageData; key: string }) {
    const { message } = props;
    const isAdmin = props.isAdmin;
    const shouldGroup = props.shouldGroup;
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

    function allow() {
        if (!isAdmin || !window.confirm("Allow message?")) return;
        updateMsg(message.id, {
            reviewed: auth.currentUser?.uid,
            autoMod: false,
        });
    }

    async function deny() {
        if (!isAdmin || !window.confirm("Retract message?")) return;
        await updateMsg(message.id, {
            reviewed: auth.currentUser?.uid,
            isRetracted: true,
        });
    }

    return (
        // Determine whether the message was sent or received by checking the author and current user
        <div
            className={`message ${auth.currentUser?.uid === message.uid ? "sent" : "received"}${
                message.photoURL === "sys" ? " sys" : ""
            }`}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            {!shouldGroup && (
                <>
                    {message.photoURL !== "sys" && (
                        <img
                            className="pfp"
                            src={message.photoURL}
                            onError={(e) => {
                                e.currentTarget.src =
                                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDI4OCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODgiIGhlaWdodD0iMjg4IiBmaWxsPSIjRTlFOUU5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIyIDEwOUMyMjIgMTM5LjM2NiAyMDQuNjQ3IDE2NS42OCAxNzkuMzE3IDE3OC41NjVDMjIzLjk4MSAxODcuNzE4IDI2Mi40NDMgMjEzLjg4NiAyODcuNjMzIDI1MEgyODhWMjg4SDBWMjUwSDAuMzY3MTg4QzI1LjU1NzQgMjEzLjg4NiA2NC4wMTkzIDE4Ny43MTggMTA4LjY4MyAxNzguNTY1QzgzLjM1MjggMTY1LjY4IDY2IDEzOS4zNjYgNjYgMTA5QzY2IDY1LjkyMTkgMTAwLjkyMiAzMSAxNDQgMzFDMTg3LjA3OCAzMSAyMjIgNjUuOTIxOSAyMjIgMTA5WiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K";
                            }}
                            alt={`Profile of ${message.displayName}`}
                            referrerPolicy="no-referrer"
                        />
                    )}
                    <div className="namedate">
                        <p className="name">
                            <b>{message.displayName}</b>
                        </p>
                        {message.photoURL !== "sys" && (
                            <p className="date">
                                {timestamp.toLocaleString("en-AU", { hour12: true })} {message.autoMod ? "[AutoMod]" : ""}{" "}
                                {message.reviewed ? "[reviewed]" : ""}
                            </p>
                        )}
                    </div>
                </>
            )}

            {!message.isRetracted ? (
                message.isMsg ? (
                    message.photoURL !== "sys" ? (
                        !message.autoMod ? (
                            <ReactMarkdown className="text" remarkPlugins={[gfm]} linkTarget="_blank">
                                {messageText}
                            </ReactMarkdown>
                        ) : isAdmin ? (
                            <p className="text automod">
                                <h4>AutoMod flagged.</h4>
                                Message content requires a review and is currently only visible to administrators.{" "}
                                <br /> <br />
                                <strong>ACTIONS</strong>{" "}
                                <button className="allow" onClick={allow}>
                                    Allow
                                </button>{" "}
                                <button className="deny" onClick={deny}>
                                    Retract
                                </button>{" "}
                                <br />
                                <i>Profanity score: {message.autoModProb.toFixed(2)}</i> <br /> <br />
                                <b>Message content:</b> <br />
                                {message.text}
                            </p>
                        ) : message.uid === auth.currentUser?.uid ? (
                            <>
                                <div className="text">
                                    <p className="waiting">
                                        <i>
                                            Your message content is currently not visible as it has not been reviewed.
                                            <br />
                                            Please wait for an admin to review it.
                                        </i>
                                        <br />
                                    </p>
                                    {messageText}
                                </div>
                            </>
                        ) : (
                            <p className="text">
                                <i>&lt;under review&gt;</i>
                            </p>
                        )
                    ) : (
                        <p className="text">{messageText}</p>
                    )
                ) : (
                    <div className="file">
                        {getFileFormat(message.text).startsWith("image") ? (
                            <img
                                onClick={() => window.open(getFileURL(message.text), "_blank")}
                                src={getFileURL(message.text)}
                                alt={`Upload by ${message.displayName}`}
                                className="fileimage"
                            />
                        ) : getFileFormat(message.text).startsWith("video") ? (
                            <video
                                controls
                                src={getFileURL(message.text)}
                                className="filevideo"
                            />
                        ) : getFileFormat(message.text).startsWith("audio") ? (
                            <audio
                                controls
                                src={getFileURL(message.text)}
                                autoPlay={false}
                                title={`Audio upload by ${message.displayName}`}
                                className="fileaudio"
                            />
                        ) : (
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
