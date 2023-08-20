/**
 *    Channel window for mobile users who cannot see the onscreen channel selector.
 *    @author Lucas Bubner, 2023
 */

import { useRef } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import Channels from "../layout/Channels";
import "../css/CommonPopup.css";

function ChannelWindow() {
    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();
    return (
        <>
            <Popup ref={tref} trigger={<button className="bbqitem">Change channel</button>}>
                <div className="outer" onClick={tclose} />
                <div className="inner">
                    <Channels />
                </div>
            </Popup>
        </>
    );
}

export default ChannelWindow;
