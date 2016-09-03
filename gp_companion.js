window.__C = {
  get_status: () => {
    try {
      return document.getElementById("player-bar-play-pause").className.indexOf("playing")!=-1?"playing":"paused";
    }
    catch (e) {
      return false
    }
  },
  get_track_number: () => {
    try {
      const t = document.getElementsByClassName("song-row currently-playing")[0].getAttribute("data-index");
      return (t?parseInt(t):-1)+1;
    }
    catch (e) {
      return -1
    }
  },
  get_title: () => {
    try {
      return document.getElementById("currently-playing-title").innerHTML;
    }
    catch (e) {
      return ""
    }
  },
  get_artist: () => {
    try {
      const t = document.getElementById("player-artist");
      return (t?t.innerHTML:"");
    }
    catch (e) {
      return ""
    }
  },
  get_album: () => {
    try {
      const t = document.getElementsByClassName("player-album")[0];
      return (t?t.innerHTML:"");
    }
    catch (e) {
      return ""
    }
  },
  get_duration: () => {
    try {
      const t = document.getElementById("time_container_duration");
      return (t?t.innerHTML:"");
    }
    catch (e) {
      return ""
    }
  },
  get_position: () => {
    try {
      const t = document.getElementById("time_container_current");
      return (t?t.innerHTML:"");
    }
    catch (e) {
      return ""
    }
  },
  play: (id) => {
    var stop_at_next_after_playing = () => {
      if (__C.get_status() === "paused") {
        setTimeout(stop_at_next_after_playing, 10);
      } else {
        __C.stop_at_next();
      }
    };

    if (id) {
      var e = document.createEvent("HTMLEvents");
      e.initEvent("click", true, false);
      if (id.indexOf("/")!==-1) {
        // this is an album
        document.querySelector("[data-id='" + id + "'] .play-button-container").dispatchEvent(e);
      } else {
        // this is a track
        var titleColName = (document.querySelector(".section-header").innerHTML === "Top songs") ? 'index' : 'title';
        document.querySelector("[data-id='" + id + "'] [data-col='" + titleColName + "'] [data-id='play']").dispatchEvent(e);
      }
    } else {
      if (__C.get_status() === "paused") {
        document.querySelector("[data-id='play-pause']").click();
        stop_at_next_after_playing();
      }
    }
  },
  pause: () => {
    if (__C.get_status() === "playing") {
      document.querySelector("[data-id='play-pause']").click();
    }
  },
  search: (category, keywords) => {
    let result = false;
    if (category === "artist") {
      __C.search_results = false;
      __C.wait_to_complete(
        ".lane-content",
        "#/srar/" + keywords.replace(/\\s+/g, "+") + "/EAI",
        (nodes)=>{
          if (nodes.length === 0) {
            __C.search_results = "[]";
          } else {
            const data = [];
            for(const n of nodes) {
              var id = n.getAttribute("data-id");
              var artist = n.querySelector(".details .details-inner .title").innerHTML;
              data.push({id, artist});
            }
            __C.search_results = JSON.stringify(data);
          }
        }
      );
      return {"processing": "search_results"};
    }
    return false;
  },

  /* utility function */
  wait_to_complete: (selector, hash, callback) => {
    if (window.location.hash === hash) {
      // same query
      const contents = document.querySelector(selector);
      callback(contents.childNodes);
    } else {
      let last_count = -1;
      const check_complete = () => {
        const contents = document.querySelector(selector);
        if (contents) {
          if (contents.childNodes.length > last_count || contents.childNodes.length===0) {
            // still loading
            last_count = contents.childNodes.length;
            setTimeout(check_complete, 100);
          } else {
            callback(contents.childNodes);
          }
        } else {
          // zero results
          callback(false);
        }
      }
      // clear out last results
      const contents = document.querySelector(selector);
      if (contents) {
        while (contents.firstChild) {
          contents.removeChild(contents.firstChild);
        }
      }
      setTimeout(function(){
        window.location.hash=hash;
        setTimeout(check_complete, 300);
      }, 10);
    }
  },
  pos_to_seconds: (pos) => {
    const p = pos.split(":");
    try {
      return parseInt(p[0])*60 + parseInt(p[1]);
    }
    catch (e) {
      return -1
    }
  },
  stop_at_next: () => {
    const pos = __C.pos_to_seconds(__C.get_position());
    const check_pos = () => {
      if (__C.pos_to_seconds(__C.get_position()) < pos) {
        __C.pause();
        // clear queue with forwards here
      } else {
        if (__C.get_status() === "playing") {
          setTimeout(check_pos, 500);
        }
      }
    }
    check_pos();
  },
}
