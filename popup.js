import { getActiveTabURL } from "./utils.js"


const onPlay = async event => {
    const bookmarkTime = event.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getActiveTabURL();

    // console.log(`in onPlay ${bookmarkTime}`);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime,
    })
}

const onDelete = async event => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = event.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById(
        "bookmark-" + bookmarkTime
    );

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime,
    });
    chrome.storage.sync.get([currentVideo], (data) => {
        const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : []

        viewBookmarks(currentVideoBookmarks);
    });
};

const setBookmarAttribute = (src, eventListener, controlParent) => {
    const controlElement = document.createElement("img");
    controlElement.src = `images/${src}-button.png`;
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParent.appendChild(controlElement);
}

const addNewBookmark = (bookmarksElement, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement("div");
    const newBookmarkElement = document.createElement("div");

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";

    setBookmarAttribute("play", onPlay, controlsElement);
    setBookmarAttribute("delete", onDelete, controlsElement);

    // console.log(`Bookmark.Time value = ${bookmark.time}`);

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(newBookmarkElement);
}

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";

    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarksElement, bookmark);
        }
    } else {
        bookmarksElement.innerHTML = '<i class = "row">No Bookmarks to show.</i>'
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const queryParameter = activeTab.url.split("?")[1];
    const urlParameter = new URLSearchParams(queryParameter);


    const currentVideo = urlParameter.get("v");
    

    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        chrome.storage.sync.get([currentVideo], (data) => {
            const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : []

            // console.log(currentVideoBookmarks);
            viewBookmarks(currentVideoBookmarks);
        });

    } else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a video page.</div>'
    }

});