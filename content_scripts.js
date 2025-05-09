
const getTime = (timeInSecond) => {
    if (timeInSecond <= 86400) {
        let date = new Date(0);
        date.setSeconds(timeInSecond);
        return date.toISOString().substring(11, 19);
    }
    return timeInSecond
}

let currentVideo = "0";
let youtubeLeftControls, youtubePlayer;

let currentVideoBookmarks = []



const fetchBookmarksCurrentVideo = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };


const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const newBookmark = {
        time: currentTime,
        desc: "Bookmark at: " + getTime(currentTime)
    };
    currentVideoBookmarks = await fetchBookmarksCurrentVideo();
    chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
    });
    // console.log(`Key ${currentVideo} ` +JSON.stringify(currentVideoBookmarks));
}

const newVideoLoaded = async () => {
    bookmarkBtnExists = document.getElementsByClassName("bookmark-btn-1")[0]
    if (!bookmarkBtnExists) {
        const bookmarkBtn = document.createElement("img");
        bookmarkBtn.src = chrome.runtime.getURL("images/add-bookmark.png")
        bookmarkBtn.className = "ytp-button" + "bookmark-btn-1";
        bookmarkBtn.title = "Click to bookmark current timestamp";
        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);

        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubeLeftControls.appendChild(bookmarkBtn);
        youtubePlayer = document.getElementsByClassName("video-stream")[0];


        // console.log("bookmark button doesn't exist and thus added")
    }
};



chrome.runtime.onMessage.addListener((obj, sender, response) => {
    // console.log("OnMessage Listener Added")
    const { type, videoId, value } = obj;
    if (type == "NEW") {
        currentVideo = videoId;
        newVideoLoaded();
    }else if(type === "PLAY"){
        // console.log("Message received play.");
        youtubePlayer.currentTime = value;
    }else if(type === "DELETE"){
        currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time !=value);
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify(currentVideoBookmarks)
        });
        // console.log(`After Deleting the bookmarks the left bookmarks are: ${JSON.stringify(currentVideoBookmarks)}`);
        
    }
});



