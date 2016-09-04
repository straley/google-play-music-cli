const lookup = () => {
  const command = $("#command").val().toLowerCase().split(/\s+/);
  $("#command").val("");
  let action = "play";
  let sub = "track";
  let track = 0;

  if (command[0] == "play") {
    command.shift();
    if (command[0] == "track") {
      sub = "track";
      command.shift();
    } else if (command[0] == "something" && (command[1] == "from" || command[1] == "by")) {
      sub = "artist";
      track = -1;
      command.shift();
      command.shift();
    }
  } else if (command[0] == "skip" || command[0] == "next" || command[0] == "forward") {
    action = "forward";
  }
  if (action === "play") {
    if (sub === "track") {
      console.log("API", "/api/search/track/" + command.join("%20"));
      $.getJSON("/api/search/track/" + command.join("%20"), function( data ) {
        console.log(data);
        if (data && data.length > 0) {
          if (track === -1) track = Math.floor(Math.random() * data.length);
          $("#results").html("Playing " + data[track].track + " by " + data[track].artist);
          console.log("/api/play/" + data[track].album_id + "/" + data[track].id);
          $.getJSON( "/api/play/" + data[track].album_id + "/" + data[track].id, function( data ) {
            console.log(data);
          });
        }
      });
    } else if (sub === "artist") {
      $.getJSON( "/api/search/artist/" + command.join("%20"), function( data ) {
        if (data && data.length > 0) {
          const id = data[0].id;
          console.log("searching for " +id);
          $.getJSON( "/api/artist/track/" + id.replace(/\/.*$/, ""), function( data ) {
            console.log(data);
            if (data && data.length > 0) {
              if (track === -1) track = Math.floor(Math.random() * data.length);
              $("#results").html("Playing " + data[track].title + " by " + data[track].artist);
              $.getJSON( "/api/play/" + data[track].id, function( data ) {
                console.log(data);
              });
            }
          });
        }
      });
    }
  } else if (action === "forward") {
    $.getJSON( "/api/forward", function( data ) {});
  }
}

const checkStatus = () => {
  $.getJSON( "/api/status", function( data ) {
    $("#results").html("Playing " + data.title + " by " + data.artist);
    $("#status").html(data.position + " / " + data.duration);
  });
}

$(document).ready(()=>{
  $("#go").click(lookup);
  $('#command').on('keypress', function (e) {
     if(e.which === 13) {
       lookup();
     }
   });
   setInterval(checkStatus, 200);
})
