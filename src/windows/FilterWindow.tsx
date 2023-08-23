/**
 *    Personal user filter settings.
 *    @author Lucas Bubner, 2023
 */
import { useRef, useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import "../css/CommonPopup.css";
import "../css/FilterWindow.css";

function FilterWindow() {
    const [blacklist, setBlacklist] = useState<string[]>([]);

    useEffect(() => {
        const filterPref = localStorage.getItem("filter");
        if (filterPref === null) {
            localStorage.setItem("filter", "true");
        }
        const filterList = localStorage.getItem("filterlist");
        if (filterList === null) {
            localStorage.setItem("filterlist", "[]");
        } else {
            setBlacklist(JSON.parse(filterList));
        }
    }, []);

    function filterChange() {
        if (!window.confirm("Change your profanity filter preference? This will reload your page.")) return;

        const filterPref = localStorage.getItem("filter");
        if (filterPref === "false") {
            localStorage.setItem("filter", "true");
        } else {
            localStorage.setItem("filter", "false");
        }

        // Refresh the page to apply the filter
        window.location.reload();
    }

    function newWord(e: Event) {
        e.preventDefault();
        const word = document.getElementById("newword") as HTMLInputElement;
        try {
            if (word.value === "") return;
            const oldStorage = JSON.parse(localStorage.getItem("filterlist") || "[]");
            if (oldStorage.includes(word.value)) return;
            oldStorage.push(word.value);
            localStorage.setItem("filterlist", JSON.stringify(oldStorage));
            // Edit all the words to include the reload required message
            setBlacklist(oldStorage.map((w: string) => w + " (reload required)"));
        } finally {
            word.value = "";
        }
    }

    function removeWord(word: string) {
        // Remove (reload required) if needed
        const idx = word.indexOf(" (reload required)");
        if (idx > -1) word = word.substring(0, idx);

        if (!window.confirm(`Remove '${word}' from your filter list?\nYou will need to reload your page for these changes to take effect.`)) return;

        const oldStorage = JSON.parse(localStorage.getItem("filterlist") || "[]");
        const index = oldStorage.indexOf(word);
        if (index > -1) {
            oldStorage.splice(index, 1);
            localStorage.setItem("filterlist", JSON.stringify(oldStorage));
            setBlacklist(oldStorage.map((w: string) => w + " (reload required)"));
        }
    }

    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();
    const topen = () => tref.current?.open();
    return (
        <>
            <div id="remote-open-filter" style={{ display: "none" }} onClick={topen} />
            <Popup
                ref={tref}
                trigger={
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
                    />
                }
                nested
            >
                <div className="outer" />
                <div className="inner">
                    <span className="close" onClick={tclose}>
                        &times;
                    </span>
                    <h3 className="ftitle">Filter</h3>
                    <div>
                        <p>
                            <b>Filter Status</b>
                        </p>
                        <div>
                            <button
                                className={localStorage.getItem("filter") === "false" ? "filter-off" : "filter-on"}
                                onClick={filterChange}
                            >
                                {localStorage.getItem("filter") === "false" ? "Off" : "On"}
                            </button>
                        </div>
                        <hr />
                        <p>
                            <b>Filter Include List</b>
                        </p>
                        <div className="filter-list">
                            {localStorage.getItem("filter") === "false" ? (
                                <p>Filter is off.</p>
                            ) : (
                                <>
                                    <div className="input-group mb-3">
                                        <input
                                            type="text"
                                            id="newword"
                                            className="form-control"
                                            placeholder="Enter a word..."
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") newWord(e as unknown as Event);
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={(e) => newWord(e as unknown as Event)}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="list-group" id="filtered">
                                        {blacklist.map((word) =>
                                            <button key={word} className="list-group-item list-group-item-action btn" onClick={() => removeWord(word)}>
                                                {word}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Popup>
        </>
    );
}

export default FilterWindow;
