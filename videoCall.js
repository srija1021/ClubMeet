let handlefail = function(err){
    console.log(err)
}

let appId = "7cedb07549934ba2a58ee5501d5811d6"
let globalStream;
let isAudioMuted = false;
let isVideoMuted = false;

let remoteContainer = document.getElementById("remoteStream")

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})   

client.init(appId, () => console.log("AgoraRTC Client Connected"), handlefail)

function removeMyVideoStream(){
    globalStream.stop();
}

function removeVideoStream(evt){
    let stream = evt.stream;
    stream.stop();
    let remDiv = document.getElementById(stream.getId())
    remDiv.parentNode.removeChild(remDiv);
}

function addVideoStream(streamId){
    console.log("Adding stream")
    let streamDiv = document.createElement("div")
    streamDiv.id = streamId 
    
    let nameNode = document.createElement("div")
    let name = document.createTextNode(streamId)
    nameNode.appendChild(name)
    nameNode.style.backgroundColor = "#581ecb"
    nameNode.style.height = "20px"
    nameNode.style.padding = "5px"
    nameNode.style.textAlign = "left"
    nameNode.style.color = "white"
    nameNode.style.fontFamily = "inherit"
    nameNode.style.fontSize = "16px"

    streamDiv.style.height = "160px"
    streamDiv.style.width = "220px"
    streamDiv.style.display = "inline-block"
    streamDiv.style.border = "3px solid #581ecb"
    streamDiv.style.marginInlineEnd = "10px"
    streamDiv.style.marginBottom = "10px"
    streamDiv.style.borderRadius = "10px"
    streamDiv.style.resize = "both"
    streamDiv.style.overflow = "auto"
    streamDiv.style.position = "relative"

    let micCross = document.createElement("img")
    micCross.id = streamId + "micCross"
    micCross.setAttribute("src", "assets/muted.png")
    micCross.setAttribute("width", "15px")
    micCross.setAttribute("height", "15px")
    micCross.style.marginLeft = "15px"
    nameNode.appendChild(micCross)
    micCross.style.visibility = "hidden";

    streamDiv.appendChild(nameNode)
    remoteContainer.appendChild(streamDiv)
    console.log("Added stream")
} 

function leaveNow() {
    client.leave(function() {
        console.log("Left!")
    }, handlefail)
    removeMyVideoStream();
    window.location.href = "index.html"
}

function joinNow() {
    localStorage.setItem("channelName", document.getElementById("channelName").value)
    localStorage.setItem("username", document.getElementById("username").value)
    window.location.href = "callPage.html"
}

function startCall() {
    var nameNode = document.createElement("div")
    var name = document.createTextNode(localStorage.getItem("username"))
    nameNode.appendChild(name)
    document.getElementById("selfStream").appendChild(nameNode)
    nameNode.style.backgroundColor = "#581ecb"
    nameNode.style.height = "20px"
    nameNode.style.padding = "5px"
    nameNode.style.textAlign = "left"
    nameNode.style.color = "white"
    nameNode.style.fontFamily = "inherit"
    nameNode.style.fontSize = "16px"

    let welcomeBox1 = document.createElement("div")
    let clubName = localStorage.getItem("channelName");
    let welcomeMsg1 = document.createTextNode(clubName.toUpperCase() + " MEETING")
    let welcomeBox2 = document.createElement("div")
    let welcomeMsg2 = document.createTextNode("IN SESSION")
    welcomeBox1.appendChild(welcomeMsg1)
    welcomeBox2.appendChild(welcomeMsg2)
    document.getElementById("meetingInfo").appendChild(welcomeBox1)
    document.getElementById("meetingInfo").appendChild(welcomeBox2)
    welcomeBox1.style.marginTop = "15%"
    welcomeBox2.style.marginTop = "8%"

    client.join(
        null,
        localStorage.getItem("channelName"),
        localStorage.getItem("username"),
        () => {
            var localStream = AgoraRTC.createStream({
                video: true,
                audio: true,
            })

            localStream.init(function(){
                localStream.play("selfStream")
                client.publish(localStream)
            })

            globalStream = localStream
        }
    )

    client.on("stream-added", function(evt) {
        console.log("Added stream")
        client.subscribe(evt.stream, handlefail)
    })

    client.on("stream-subscribed", function(evt) {
        console.log("Subscribed stream")
        let stream = evt.stream
        addVideoStream(stream.getId())  
        stream.play(stream.getId())
    })

    client.on("peer-leave", function(evt) {
        console.log("Peer has left")
        removeVideoStream(evt)
    })

    client.on("mute-audio", function(evt) {
        var uid = evt.uid
        console.log("mute audio:" + uid)
        showMic(uid)
    });

    client.on("unmute-audio", function (evt) {
        var uid = evt.uid
        console.log("unmute audio:" + uid)
        hideMic(uid)
    });
}

function showMic(userId) {
    let micImg = document.getElementById(userId + "micCross");
    micImg.style.visibility = "visible";
}

function hideMic(userId) {
    let micImg = document.getElementById(userId + "micCross");
    micImg.style.visibility = "hidden";
}

let videoIcon = document.getElementById("videoMute");
let micIcon = document.getElementById("audioMute");

function muteVideo() {
    if (!isVideoMuted) {
        globalStream.muteVideo();
        isVideoMuted = true;
        videoIcon.style.border = "2px solid #581ecb"
    } else {
        globalStream.unmuteVideo();
        isVideoMuted = false;
        videoIcon.style.border = "2px solid white"
    }
}

function muteAudio() {
    if (!isAudioMuted) {
        globalStream.muteAudio();
        isAudioMuted = true;
        micIcon.style.border = "2px solid #581ecb"
    } else {
        globalStream.unmuteAudio();
        isAudioMuted = false;
        micIcon.style.border = "2px solid white"
    }
}