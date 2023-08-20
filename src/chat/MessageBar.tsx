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

// Change the filter preference of the user
export function filterChange() {
    if (
        !window.confirm(
            "Change your profanity filter preference? This will reload your page."
        )
    )
        return;

    const filterPref = localStorage.getItem("filter");
    if (filterPref === "false") {
        localStorage.setItem("filter", "true");
    } else {
        localStorage.setItem("filter", "false");
    }

    // Refresh the page to apply the filter
    window.location.reload();
}

function MessageBar() {
    const [formVal, setFormVal] = useState("");
    const [timestamp, setLastTimestamp] = useState<number>(Date.now());
    const [messagesSent, setMessagesSent] = useState(0);
    const [writePerms, setWritePerms] = useState(false);
    const [formLock, setFormLock] = useState(false);

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

        uploadMsg(formVal).then(() => {
            setFormVal("");
            setFormLock(false);
            // Put focus back on the input box
            setTimeout(() => {
                (document.getElementsByClassName("msginput")[0] as HTMLInputElement).focus();
            }, 100);
        });

        // Lock the form while the message is being sent
        setFormLock(true);
        setFormVal("Scanning message...");
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
                                maxLength={4000}
                                disabled={formLock}
                                style={{ fontStyle: formLock ? "italic" : "normal" }}
                            />
                            <img
                                className="filterbutton"
                                src={
                                    localStorage.getItem("filter") === "false"
                                        ? "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNTEyLjAwMDAwMHB0IiBoZWlnaHQ9IjUxMi4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDUxMi4wMDAwMDAgNTEyLjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTEyLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iI2VkMWMyNCIgc3Ryb2tlPSJub25lIj4KPHBhdGggZD0iTTY1NSA0MzcxIGMtMjIgLTEwIC00OCAtMjcgLTU3IC0zNyAtNDUgLTUxIC02MSAtMTUwIC0zNCAtMjAyIDggLTE1CjMzNyAtMzQ5IDczMCAtNzQyIGw3MTYgLTcxNSAwIC03MTMgYzAgLTYyMCAyIC03MTcgMTUgLTc1MCAxOSAtNDUgNzcyIC04MDQKODIxIC04MjcgMzcgLTE3IDExMCAtMjAgMTUxIC00IDQyIDE1IDkyIDY4IDEwMyAxMDkgNiAyMiAxMCA0MzUgMTAgMTExMCBsMAoxMDc1IDcxNiA3MTUgYzM5MyAzOTMgNzIyIDcyNyA3MzAgNzQyIDI5IDU2IDcgMTY2IC00MiAyMTAgLTU3IDUxIDQ4IDQ4Ci0xOTU2IDQ4IC0xNzg2IDAgLTE4NjUgLTEgLTE5MDMgLTE5eiIvPgo8L2c+Cjwvc3ZnPgo="
                                        : "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDIwMDEwOTA0Ly9FTiIKICJodHRwOi8vd3d3LnczLm9yZy9UUi8yMDAxL1JFQy1TVkctMjAwMTA5MDQvRFREL3N2ZzEwLmR0ZCI+CjxzdmcgdmVyc2lvbj0iMS4wIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiB3aWR0aD0iNTEyLjAwMDAwMHB0IiBoZWlnaHQ9IjUxMi4wMDAwMDBwdCIgdmlld0JveD0iMCAwIDUxMi4wMDAwMDAgNTEyLjAwMDAwMCIKIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiPgoKPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4wMDAwMDAsNTEyLjAwMDAwMCkgc2NhbGUoMC4xMDAwMDAsLTAuMTAwMDAwKSIKZmlsbD0iIzAwZmYwOCIgc3Ryb2tlPSJub25lIj4KPHBhdGggZD0iTTY1NSA0MzcxIGMtMjIgLTEwIC00OCAtMjcgLTU3IC0zNyAtNDUgLTUxIC02MSAtMTUwIC0zNCAtMjAyIDggLTE1CjMzNyAtMzQ5IDczMCAtNzQyIGw3MTYgLTcxNSAwIC03MTMgYzAgLTYyMCAyIC03MTcgMTUgLTc1MCAxOSAtNDUgNzcyIC04MDQKODIxIC04MjcgMzcgLTE3IDExMCAtMjAgMTUxIC00IDQyIDE1IDkyIDY4IDEwMyAxMDkgNiAyMiAxMCA0MzUgMTAgMTExMCBsMAoxMDc1IDcxNiA3MTUgYzM5MyAzOTMgNzIyIDcyNyA3MzAgNzQyIDI5IDU2IDcgMTY2IC00MiAyMTAgLTU3IDUxIDQ4IDQ4Ci0xOTU2IDQ4IC0xNzg2IDAgLTE4NjUgLTEgLTE5MDMgLTE5eiIvPgo8L2c+Cjwvc3ZnPgo="
                                }
                                width="50"
                                height="50"
                                alt="Filter Button"
                                onClick={filterChange}
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
