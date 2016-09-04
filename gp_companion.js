window.__C = {
  // settings
  queue: [],
  search_results: false,

  // methods
  // get the player status
  get_status: () => {
    try {
      return document.getElementById("player-bar-play-pause").className.indexOf("playing")!=-1?"playing":"paused";
    }
    catch (e) {
      return false;
    }
  },
  // get the number of the track
  get_track_number: () => {
    try {
      const t = document.getElementsByClassName("song-row currently-playing")[0].getAttribute("data-index");
      return (t?parseInt(t):-1)+1;
    }
    catch (e) {
      return -1;
    }
  },
  // get the title of the track
  get_title: () => {
    try {
      return document.getElementById("currently-playing-title").innerHTML;
    }
    catch (e) {
      return "";
    }
  },
  // get the name of the artist
  get_artist: () => {
    try {
      const t = document.getElementById("player-artist");
      return (t?t.innerHTML:"");
    }
    catch (e) {
      return "";
    }
  },
  // get the name of the album
  get_album: () => {
    try {
      const t = document.getElementsByClassName("player-album")[0];
      return (t?t.innerHTML:"");
    }
    catch (e) {
      return "";
    }
  },
  // get the duration of the track
  get_duration: () => {
    try {
      const t = document.getElementById("time_container_duration");
      return (t?t.innerHTML:"");
    }
    catch (e) {
      return "";
    }
  },
  // get the position of the track
  get_position: () => {
    try {
      const t = document.getElementById("time_container_current");
      return (t?t.innerHTML:"");
    }
    catch (e) {
      return "";
    }
  },
  // resume playing, or play an ID
  play: (lookup_album_id, lookup_track_id) => {
    let tracks = [];
    let trackFound = false;

    if (typeof lookup_album_id !== "undefined") {
      // go to album page
      __C.wait_to_complete(
        ".song-table tbody",
        false,
        "#/album/" + lookup_album_id,
        (nodes)=>{
          if (nodes && nodes.length > 0) {
            const data = [];
            for(const n of nodes) {
              if (n.className.split(" ").indexOf("song-row") !== -1) {
                const id = n.getAttribute("data-id");
                const track = n.querySelector("[data-col='title'] span").innerHTML.replace(/<[^>]*>/, '');
                const duration = n.querySelector("[data-col='duration'] span").innerHTML;
                const artist = n.querySelector("[data-col='artist'] span a").innerHTML;
                const artist_id = n.querySelector("[data-col='artist']").getAttribute("data-matched-id");
                const album = n.querySelector("[data-col='album'] span a").innerHTML;
                const album_id = n.querySelector("[data-col='album']").getAttribute("data-matched-id");

                if (id === lookup_track_id) {
                  trackFound = true;
                }

                data.push({id, track, album, album_id, artist, artist_id, duration});
              }
            }
            tracks = JSON.stringify(data);
            if (typeof lookup_track_id !== "undefined") {
              if (trackFound) {
                const chain = [
                  {
                    selector:"#queue",
                    event:"click",
                    delay:100
                  },
                  {
                    selector:"[data-id='clear-queue']",
                    event:"click",
                    delay:100
                  },
                  {
                    selector:"[data-id='" + lookup_track_id + "']",
                    action:"scrollIntoView",
                    delay:100
                  },
                  {
                    selector:"[data-id='" + lookup_track_id + "'] [data-id='menu']",
                    event:"click",
                    delay:200
                  },
                  {
                    selector:"[id='\:8']",
                    event:"mousedown",
                    delay:200
                  },
                  {
                    selector:"[id='\:8']",
                    event:"mouseup",
                    delay:200
                  }
                ];

                // see if queue is already displayed
                if (document.querySelector("#queue-overlay").getAttribute("style").indexOf("display: none")!==-1) {
                  // don't show it
                  chain.shift();
                }

                __C.chain(chain, __C.unpause);
              }
            } else {
              // add all tracks to queue
            }
          } else {
            tracks = "[]";
          }
        }
      );
    }
  },
  toggle_player: (mode, callback) => {
    let count = 0;
    const do_toggle = () => {
      count++;
      const e = document.querySelector("#player-bar-play-pause");
      if (e.getAttribute("aria-disabled")==="true") {
        if (count < 20) {
          setTimeout(()=>{
            do_toggle();
          }, 200)
        } else {
          if (typeof callback === "function") callback();
        }
      } else {
        if (count < 20) {
          setTimeout(()=>{
            if (__C.get_status() !== mode) {
              e.click();
              if (typeof callback === "function") callback();
            } else {
              if (typeof callback === "function") callback();
            }
          }, 200);
        } else {
          if (typeof callback === "function") callback();
        }
      }
    }
    do_toggle();
  },
  // pause playing
  pause: (callback) => {
    __C.toggle_player("paused", callback);
  },
  // unpause playing
  unpause: (callback) => {
    __C.toggle_player("playing", callback);
  },
  // search for an artist[, album], or track
  search: (category, keywords) => {
    let result = false;
    if (category === "artist") {
      __C.search_results = false;
      __C.wait_to_complete(
        ".lane-content",
        false,
        "#/srar/" + keywords.replace(/\\s+/g, "+") + "/EAI",
        (nodes)=>{
          if (nodes.length === 0) {
            __C.search_results = "[]";
          } else {
            const data = [];
            for(const n of nodes) {
              const id = n.getAttribute("data-id").replace(/\/.*$/, "");
              const artist = n.querySelector(".details .details-inner .title").innerHTML;
              data.push({id, artist});
            }
            __C.search_results = JSON.stringify(data);
          }
        }
      );
      return {"processing": "search_results"};
    } else if (category === "track") {
      __C.search_results = false;
      __C.wait_to_complete(
        ".songlist-container tbody",
        false,
        "#/srs/" + keywords.replace(/\\s+/g, "+") + "/EAE",
        (nodes)=>{
          if (nodes && nodes.length > 0) {
            const data = [];
            for(const n of nodes) {
              if (n.className.replace(/\s+$/,"") === "song-row") {
                const id = n.getAttribute("data-id");
                const track = n.querySelector("[data-col='title'] span").innerHTML.replace(/<[^>]*>/, '');
                const duration = n.querySelector("[data-col='duration'] span").innerHTML;
                const artist = n.querySelector("[data-col='artist'] span a").innerHTML;
                const artist_id = n.querySelector("[data-col='artist']").getAttribute("data-matched-id");
                const album = n.querySelector("[data-col='album'] span a").innerHTML;
                const album_id = n.querySelector("[data-col='album']").getAttribute("data-matched-id");
                data.push({id, track, album, album_id, artist, artist_id, duration});
              }
            }
            __C.search_results = JSON.stringify(data);
          } else {
            __C.search_results = "[]";
          }
        }
      );
    }
    return {"processing": "search_results"};
  },
  artist:(category, id) => {
    let result = false;
    if (category === "track") {
      __C.search_results = false;
      __C.wait_to_complete(
        ".songlist-container tbody",
        false,
        "#/sarts/" + id,
        (nodes)=>{
          if (nodes.length === 0) {
            __C.search_results = "[]";
          } else {
            const data = [];
            for(const n of nodes) {
              if (n.className.replace(/\s+$/,"") === "song-row") {
                const id = n.getAttribute("data-id");
                const track = n.querySelector("[data-col='title'] span").innerHTML.replace(/<[^>]*>/, '');
                const duration = n.querySelector("[data-col='duration'] span").innerHTML;
                const artist = n.querySelector("[data-col='artist'] span a").innerHTML;
                const artist_id = n.querySelector("[data-col='artist']").getAttribute("data-matched-id");
                const album = n.querySelector("[data-col='album'] span a").innerHTML;
                const album_id = n.querySelector("[data-col='album']").getAttribute("data-matched-id");
                data.push({id, track, album, album_id, artist, artist_id, duration});
              }
            }
            __C.search_results = JSON.stringify(data);
          }
        }
      );
    }
    return {"processing": "search_results"};
  },

  /* utility function */

  // wait for injected content load
  wait_to_complete: (selector, test, hash, callback) => {
    if (window.location.hash === hash) {
      // same query
      const contents = document.querySelector(selector);
      callback(contents && contents.childNodes);
    } else {
      let last_count = -1;
      let tries = 0;
      const check_complete = () => {
        tries++;
        const contents = document.querySelector(selector);
        let testPassed = true;
        if (test && (typeof test === "function")) {
          testPassed = test();
        }
        if (testPassed && contents) {
          if (contents.childNodes.length > last_count || contents.childNodes.length===0) {
            // still loading
            last_count = contents.childNodes.length;
            if (tries < 40) {
              setTimeout(check_complete, 50);
            } else {
              // zero results
              callback(false);
            }
          } else {
            callback(contents.childNodes);
          }
        } else {
          if (tries < 40) {
            setTimeout(check_complete, 50);
          } else {
            // zero results
            callback(false);
          }
        }
      }
      // clear out last results
      const contents = document.querySelector(selector);
      if (contents) {
        while (contents.firstChild) {
          contents.removeChild(contents.firstChild);
        }
      }
      setTimeout(() => {
        window.location.hash=hash;
        setTimeout(check_complete, 300);
      }, 100);
    }
  },
  // convert position to seconds
  pos_to_seconds: (pos) => {
    const p = pos.split(":");
    try {
      return parseInt(p[0])*60 + parseInt(p[1]);
    }
    catch (e) {
      return -1
    }
  },
  // do a series of dom actions
  chain: (actions, callback) => {
    const do_next_action = () => {
      if (actions.length > 0) {
        a = actions.shift();
        let t = document.querySelector(a.selector);
        if (t) {
          if (a.event) {
            const e = new Event(a.event, {"bubbles":true, "cancelable":false});
            t.dispatchEvent(e);
          }
          if (a.action) {
            t[a.action]();
          }
        }
        setTimeout(() => {
          do_next_action();
        }, a.delay);
      } else {
        if (typeof callback === "function") callback();
      }
    }
    do_next_action();
  }
}
