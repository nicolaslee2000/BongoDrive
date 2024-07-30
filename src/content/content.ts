import button, { setIsButtonRunning } from "./downloadButton/downloadButton";
import $ from "jquery";

// on document load
const init = () => {
  button.on("click", handleOnClick);
  const observer = new MutationObserver(() => {
    const btn = $("button[data-specific-auth-trigger='download']");
    if ($(btn).attr("class") !== undefined) {
      $("button[data-specific-auth-trigger='download']").replaceWith(button);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { subtree: true, childList: true });
};

const handleOnClick = async (e: JQuery.Event) => {
  e.preventDefault();
  setIsButtonRunning(true);
  try {
    await download();
  } catch (e) {
    alert("unknown downloader extension error" + e);
    throw e;
  }
  setIsButtonRunning(false);
};

const download = async () => {
  const doc = await fetch(window.location.href).then((res) => res.text());
  const match = /"file_preview":("[^"]*")/.exec(doc);
  if (!match || match.length < 2) {
    alert("bongodrive: download link unavailable");
    return;
  }
  const downloadUrl = await fetch(JSON.parse(match[1]))
    .then((res) => res.blob())
    .then((blob) => URL.createObjectURL(blob));

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = getFileName(doc);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getFileName = (doc: string) => {
  const match = /"filename":("[^"]*")/.exec(doc);
  if (!match) {
    return "preview.pdf";
  }
  return JSON.parse(match[1]);
};

window.addEventListener("load", init);
