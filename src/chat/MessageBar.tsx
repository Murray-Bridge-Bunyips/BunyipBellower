/**
 *    Message bar module to manage user input of messages and files
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import "../css/MessageBar.css";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import FileUploads from "./FileUploads";
import Scroll from "../layout/Scroll";
import { auth, getData, isMessageOverLimit, toCommas, uploadMsg, UserData } from "../Firebase";

function MessageBar() {
    const [formVal, setFormVal] = useState("");
    const [timestamp, setLastTimestamp] = useState<number>(Date.now());
    const [messagesSent, setMessagesSent] = useState(0);
    const [writePerms, setWritePerms] = useState(false);

    // Ensure the user has permission to write messages to the database.
    useEffect(() => {
        getData("users", toCommas(auth.currentUser?.email!)).then((userData: UserData) =>
            setWritePerms(userData.write)
        );
    }, []);

    // Enforce cooldown on users that send too many messages at once.
    function manageMsgSend(e: FormEvent) {
        e.preventDefault();
        setMessagesSent((prev) => prev + 1);
        setLastTimestamp(Date.now());

        if (Date.now() - timestamp < 3000 && messagesSent > 3) {
            alert("You're sending messages too fast! Please slow down.");
            return;
        }

        uploadMsg(formVal);
        setFormVal("");
    }

    // Reset cooldown every 2 seconds on rerender
    useEffect(() => {
        setTimeout(() => {
            setMessagesSent(0);
        }, 2000);
    }, []);

    // Alert the user if their message has exceeded the 4000 character limit and update the formVal state.
    function handleMessageChange(e: ChangeEvent<HTMLInputElement>) {
        setFormVal(e.target.value);
        // prettier-ignore
        if (isMessageOverLimit(formVal))
            if (window.confirm("Caution! You have exceeded the 4000 character limit and will not be able to send your message! Trim message?"))
                setFormVal(formVal.substring(0, 4000));
    }

    return (
        <div className="messagebar">
            <form onSubmit={(e) => manageMsgSend(e)}>
                {/* Standard user input box for text */}
                <div className="input-group">
                    {writePerms ? (
                        <>
                            <FileUploads />
                            <input
                                type="text"
                                onChange={(e) => handleMessageChange(e)}
                                value={formVal}
                                className="msginput"
                            />
                            {/* Submit button for messages, also prevents sending if there is no form value */}
                            <button
                                type="submit"
                                disabled={!(formVal || isMessageOverLimit(formVal))}
                                className="sendbutton"
                            />
                        </>
                    ) : (
                        <div className="msginput nomsg">
                            <p>You do not have permission to send any messages.</p>
                        </div>
                    )}
                </div>
            </form>
            <Scroll />
        </div>
    );
}

export default MessageBar;
