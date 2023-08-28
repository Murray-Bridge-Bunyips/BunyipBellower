/**
 *     File viewer component.
 *     @author Lucas Bubner, 2023
 */

import { FC } from "react";

interface FileViewerProps {
    url: string;
    format: string;
    displayName: string;
}

const FileViewer: FC<FileViewerProps> = ({ url, format, displayName }) => {
    const isImage = format.startsWith("image");
    const isVideo = format.startsWith("video");
    const isAudio = format.startsWith("audio");

    const renderFile = () => {
        if (isImage) {
            return (
                <img
                    onClick={() => window.open(url, "_blank")}
                    src={url}
                    alt={`Upload by ${displayName}`}
                    className="fileimage"
                />
            );
        } else if (isVideo) {
            return <video controls src={url} className="filevideo" />;
        } else if (isAudio) {
            return (
                <audio
                    controls
                    src={url}
                    autoPlay={false}
                    title={`Audio upload by ${displayName}`}
                    className="fileaudio"
                />
            );
        } else {
            return (
                <a target="_blank" rel="noreferrer" href={url}>
                    <b>
                        View {format || "unknown"} file uploaded by {displayName}
                    </b>
                </a>
            );
        }
    };

    return <>{renderFile()}</>;
};

export default FileViewer;
