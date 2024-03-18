async function callCreateRoom(nickname) {
    const response = await fetch(`http://localhost:3000/api/create-room?ownerName=${nickname}`);
    if (response.status != 200) {
        throw new Error('Error when creating room');
    }
    const data = await response.json();
    const roomId = data.id;
    sessionStorage.setItem('roomId', roomId);
    sessionStorage.setItem('username', nickname);
    window.location.href = `http://localhost:3000/room/${roomId}`;
}

window.onload = _ => {
    const nickname = localStorage.getItem('nickname');
    if (!nickname) {
        return;
    }
    const nicknameInput = document.getElementById('nickname');
    nicknameInput.value = nickname;
};

document.getElementById('enter-room').onclick = async (_) => {
    const nicknameInput = document.getElementById('nickname');
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
        alert('inform a nickname to enter the room');
        return;
    }
    localStorage.setItem('nickname', nickname);

    try {
        await callCreateRoom();
    } catch(e) {
        alert('It was not possible to create a room');
        console.log(e.message);
    }
};