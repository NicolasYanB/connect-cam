let localStream;
const roomId = sessionStorage.getItem('roomId');
const isOwner = !!(sessionStorage.getItem('isOwner'));
const url = 'http://localhost:3000';
let peerConnection = new RTCPeerConnection();
let webSocket = new WebSocket('ws://localhost:3000');

WebSocket.prototype.sendRequest = function (payload) {
    const message = JSON.stringify(payload);
    this.send(message);
};

peerConnection.onicecandidate = event => {
    if (!event.candidate) return;
    const sendCandidateData = {
        event: 'candidate',
        payload: {
            client: isOwner ? 'owner' : 'visitor',
            candidate: event.candidate,
            roomId
        }
    };
    webSocket.sendRequest(sendCandidateData);
};

function found() {
    peerConnection.createOffer().then(data => {
        peerConnection.setLocalDescription(data);
        const offerRequest = {
            event: 'send',
            payload: {
                type: 'offer',
                roomId,
                data
            }
        };
        webSocket.sendRequest(offerRequest);
    });
}

function receive(payload) {
    const {type, data} = payload;
    const remoteDescription = new RTCSessionDescription(data);
    if (type === 'offer') {
        peerConnection.setRemoteDescription(remoteDescription);
        peerConnection.createAnswer().then(data => {
            peerConnection.setLocalDescription(data);
            const answerRequest = {
                event: 'send',
                payload: {
                    type: 'answer',
                    roomId,
                    data
                }
            };
            webSocket.sendRequest(answerRequest);
        });
    } if (type === 'answer') {
        peerConnection.setRemoteDescription(remoteDescription);
    }
}

function newCandidate (payload) {
    const {candidate} = payload;
    peerConnection.addIceCandidate(candidate);
}

function exit () {
    peerConnection.close();
    window.location.href = url;
}

function disconnect() {
    document.getElementById('remote-video').srcObject = null;
}

const events = {
    'found': found,
    'receive': receive,
    'new-candidate': newCandidate,
    'exit': exit,
    'disconnect-peer': disconnect
};

webSocket.onmessage = function (e) {
    const parsed = JSON.parse(e.data);
    const {event, payload} = parsed;
    listener = events[event];
    listener(payload);
};

function close() {
    localStream.getTracks().forEach(track => track.enabled = false);
    const eventType = isOwner ? 'end' : 'disconnect';
    const request = {
        event: eventType,
        payload: {
            roomId
        }
    };
    webSocket.sendRequest(request);
    peerConnection.close();
    window.location.href = url;
}

window.onload = async (_) => {
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    const remoteStream = new MediaStream();
    document.getElementById('local-video').srcObject = localStream;

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = event => {
        document.getElementById('remote-video').srcObject = remoteStream;
        event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
    };

    const roomId = sessionStorage.getItem('roomId');
    if (isOwner) {
        const openRequest = {
            event: 'open',
            payload: {roomId}
        };
        webSocket.sendRequest(openRequest);
    } else {
        const joinRequest = {
            event: 'join',
            payload: {roomId}
        };
        webSocket.sendRequest(joinRequest);
    }
};

window.addEventListener('pagehide', event => {
    if (event.persisted) return; // if event.persisted is true, then the page will not close
    close();
});

document.getElementById('cam').onclick = event => {
    const videoTrack = localStream.getTracks().find(track => track.kind === 'video');
    const div = event.target.tagName === 'DIV' ? event.target : event.target.parentNode;
    const img = document.getElementById('cam-img');
    if (videoTrack.enabled) {
        videoTrack.enabled = false;
        div.style.backgroundColor = 'rgba(219, 50, 77, 0.9)';
        img.src = "/images/cam_off.svg";
    } else {
        videoTrack.enabled = true;
        div.style.backgroundColor = 'rgba(47, 47, 47, 0.9)';
        img.src = '/images/cam_on.svg';
    }
};

document.getElementById('mic').onclick = event => {
    const audioTrack = localStream.getTracks().find(track => track.kind === 'audio');
    const div = event.target.tagName === 'DIV' ? event.target : event.target.parentNode;
    const img = document.getElementById('mic-img');
    if (audioTrack.enabled) {
        audioTrack.enabled = false;
        div.style.backgroundColor = 'rgba(219, 50, 77, 0.9)';
        img.src = '/images/mic_off.svg';
    } else {
        audioTrack.enabled = true;
        div.style.backgroundColor = 'rgba(47, 47, 47, 0.9)';
        img.src = '/images/mic_on.svg';
    }
};

document.getElementById('call-end').onclick = close;