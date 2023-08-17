/**
 *    Menu element which shows all channels the user has access to and allows them to open them.
 *    @author Lucas Bubner, 2023
 *    @author Lachlan Paul, 2023
 */

import "../css/Channels.css";
import { Fragment, useState, useEffect } from "react";
import { onValue, ref } from "firebase/database";
import { setCurrentChannel, db, removeChannel } from "../Firebase";

function Channels() {
    const [channels, setChannels] = useState<Array<string>>([]);
    useEffect(() => {
        const unsubscribe = onValue(ref(db, "messages"), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setChannels(Object.keys(data));
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="menu">
            <center>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    try {
                        setCurrentChannel((document.getElementById("channelName") as HTMLInputElement).value);
                    } catch (e) {
                        alert(e);
                    }
                    (document.getElementById("channelName") as HTMLInputElement).value = "";
                }}>
                    <input type="text" id="channelName" placeholder="Enter a channel name" />
                </form>
                <button className="buttons" onClick={() => setCurrentChannel("main")}>
                    main
                </button>
                <hr />
                {channels.map((channel) => { 
                    if (channel === "main") return;
                    return (
                        <Fragment key={channel}>
                            <button className="buttons" onClick={() => setCurrentChannel(channel)}>
                                {channel}
                            </button>
                            <button onClick={() => { if (window.confirm(`Confirm removal of ${channel}?`)) removeChannel(channel);}} className="oblbutton">
                                obliterate {channel}
                            </button>
                        </Fragment>
                    );
                })}
            </center>
        </div>
    );
}

export default Channels;
