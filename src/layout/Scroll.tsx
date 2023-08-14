/**
 *    Button to scroll to the bottom of the page with a single click.
 *    @author Lucas Bubner, 2023
 */

import { useEffect, useState } from "react";
import "../css/Scroll.css";

function Scroll() {
    const [showBtn, setShowBtn] = useState(false);
    useEffect(() => {
        window.addEventListener("scroll", () => {
            // If the window is 1000 pixels above the bottom of the page, then display the scroll to bottom button.
            if (window.scrollY < document.documentElement.scrollHeight - document.documentElement.clientHeight - 1000) {
                setShowBtn(true);
            } else {
                setShowBtn(false);
            }
        });
    }, []);

    function scrollToBottom() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "auto",
        });
    }

    return <>{showBtn && <button className="scroll" onClick={scrollToBottom} />}</>;
}

export default Scroll;
