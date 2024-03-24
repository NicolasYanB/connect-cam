let localStream;
const roomId = sessionStorage.getItem('roomId');
const isOwner = !!(sessionStorage.getItem('isOwner'));
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

const events = {
    'found': found,
    'receive': receive,
    'new-candidate': newCandidate
};

webSocket.onmessage = function (e) {
    const parsed = JSON.parse(e.data);
    const {event, payload} = parsed;
    listener = events[event];
    listener(payload);
};

window.onload = async (_) => {
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    const remoteStream = new MediaStream();
    document.getElementById('local-video').srcObject = localStream;
    document.getElementById('remote-video').srcObject = remoteStream;

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = event => {
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