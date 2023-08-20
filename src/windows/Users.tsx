/**
 *    User presence manager for client information, and user count dialogues.
 *    @author Lucas Bubner, 2023
 */
import { useRef } from "react";
import { auth, toDots, UserData } from "../Firebase";
import Popup from "reactjs-popup";
import { PopupActions } from "reactjs-popup/dist/types";
import "../css/Users.css";
import "../css/CommonPopup.css";

// prettier-ignore
function Users({online, offline, unknown}: {
    online: Array<UserData>;
    offline: Array<UserData>;
    unknown: Array<string>
}) {
    const tref = useRef<PopupActions | null>(null);
    const tclose = () => tref.current?.close();
    const topen = () => tref.current?.open();
    return (
        <>
            <div className="userPfps">
                {online.map((user) => {
                    if (user.uid === auth.currentUser?.uid || !user.pfp) return;
                    return <img onClick={topen} src={user.pfp} key={user.uid} alt={user.name} title={user.name} onError={
                        (e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDI4OCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODgiIGhlaWdodD0iMjg4IiBmaWxsPSIjRTlFOUU5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIyIDEwOUMyMjIgMTM5LjM2NiAyMDQuNjQ3IDE2NS42OCAxNzkuMzE3IDE3OC41NjVDMjIzLjk4MSAxODcuNzE4IDI2Mi40NDMgMjEzLjg4NiAyODcuNjMzIDI1MEgyODhWMjg4SDBWMjUwSDAuMzY3MTg4QzI1LjU1NzQgMjEzLjg4NiA2NC4wMTkzIDE4Ny43MTggMTA4LjY4MyAxNzguNTY1QzgzLjM1MjggMTY1LjY4IDY2IDEzOS4zNjYgNjYgMTA5QzY2IDY1LjkyMTkgMTAwLjkyMiAzMSAxNDQgMzFDMTg3LjA3OCAzMSAyMjIgNjUuOTIxOSAyMjIgMTA5WiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K";
                        }
                    }/>;
                })}
                <div className="backupname">
                    <b>Bunyip Bellower</b>
                    <br/>
                    {online.length} user(s) online
                </div>
            </div>
            <div id="remote-open" style={{ display: "none" }} onClick={topen}/>
            {online.length > 8 && <div className="extrausers">+{online.length - 8}</div>}
            {online.length <= 1 && <button className="onlyuser" onClick={topen}/>}
            <Popup ref={tref}>
                <div className="outer"/>
                <div className="inner userinner">
                    <span className="close" onClick={tclose}>
                        &times;
                    </span>
                    <h2 className="text-center">Bunyip Bellower</h2>
                    <h5 className="text-center">User Status List</h5>
                    <hr/>
                    <ul>
                        {online.map((user) => {
                            return (
                                <li className="useronline" key={user.uid}>
                                    <img src={user.pfp} alt={user.name} width="50" onError={
                                        (e) => {
                                            (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDI4OCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODgiIGhlaWdodD0iMjg4IiBmaWxsPSIjRTlFOUU5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIyIDEwOUMyMjIgMTM5LjM2NiAyMDQuNjQ3IDE2NS42OCAxNzkuMzE3IDE3OC41NjVDMjIzLjk4MSAxODcuNzE4IDI2Mi40NDMgMjEzLjg4NiAyODcuNjMzIDI1MEgyODhWMjg4SDBWMjUwSDAuMzY3MTg4QzI1LjU1NzQgMjEzLjg4NiA2NC4wMTkzIDE4Ny43MTggMTA4LjY4MyAxNzguNTY1QzgzLjM1MjggMTY1LjY4IDY2IDEzOS4zNjYgNjYgMTA5QzY2IDY1LjkyMTkgMTAwLjkyMiAzMSAxNDQgMzFDMTg3LjA3OCAzMSAyMjIgNjUuOTIxOSAyMjIgMTA5WiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K";
                                        }
                                    }/> &nbsp;
                                    {user.name} <br/>
                                    <p>Currently online</p>
                                </li>
                            );
                        })}
                        <br/>
                        {offline.map((user) => {
                            if (typeof user.online !== "object") return;
                            const timestamp = new Date(user.online.lastseen);
                            return (
                                <li className="useroffline" key={user.uid}>
                                    <img src={user.pfp} alt={user.name} width="50" onError={
                                        (e) => {
                                            (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDI4OCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODgiIGhlaWdodD0iMjg4IiBmaWxsPSIjRTlFOUU5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIyIDEwOUMyMjIgMTM5LjM2NiAyMDQuNjQ3IDE2NS42OCAxNzkuMzE3IDE3OC41NjVDMjIzLjk4MSAxODcuNzE4IDI2Mi40NDMgMjEzLjg4NiAyODcuNjMzIDI1MEgyODhWMjg4SDBWMjUwSDAuMzY3MTg4QzI1LjU1NzQgMjEzLjg4NiA2NC4wMTkzIDE4Ny43MTggMTA4LjY4MyAxNzguNTY1QzgzLjM1MjggMTY1LjY4IDY2IDEzOS4zNjYgNjYgMTA5QzY2IDY1LjkyMTkgMTAwLjkyMiAzMSAxNDQgMzFDMTg3LjA3OCAzMSAyMjIgNjUuOTIxOSAyMjIgMTA5WiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K";
                                        }
                                    }/> &nbsp;
                                    {user.name} <br/>
                                    <p>Offline since {timestamp.toLocaleString("en-AU", {hour12: true})}</p>
                                </li>
                            );
                        })}
                        <br/>
                        {unknown.map((email) => {
                            return (
                                <li className="useroffline userunknown" key={email}>
                                    <img
                                        alt="Unknown user"
                                        width="50"
                                        src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjg4IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDI4OCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODgiIGhlaWdodD0iMjg4IiBmaWxsPSIjRTlFOUU5Ii8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIyIDEwOUMyMjIgMTM5LjM2NiAyMDQuNjQ3IDE2NS42OCAxNzkuMzE3IDE3OC41NjVDMjIzLjk4MSAxODcuNzE4IDI2Mi40NDMgMjEzLjg4NiAyODcuNjMzIDI1MEgyODhWMjg4SDBWMjUwSDAuMzY3MTg4QzI1LjU1NzQgMjEzLjg4NiA2NC4wMTkzIDE4Ny43MTggMTA4LjY4MyAxNzguNTY1QzgzLjM1MjggMTY1LjY4IDY2IDEzOS4zNjYgNjYgMTA5QzY2IDY1LjkyMTkgMTAwLjkyMiAzMSAxNDQgMzFDMTg3LjA3OCAzMSAyMjIgNjUuOTIxOSAyMjIgMTA5WiIgZmlsbD0iIzAwMDAwMCIvPgo8L3N2Zz4K"
                                    /> &nbsp;
                                    {toDots(email)} <br/>
                                    <p>Never logged in</p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </Popup>
        </>
    );
}

export default Users;
