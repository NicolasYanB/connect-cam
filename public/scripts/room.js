let localStream;

window.onload = async (_) => {
    localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    document.getElementById('local-video').srcObject = localStream;
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