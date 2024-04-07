/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { socket } from "../socket";

export default function StartGame({ roomID, setRoomID, setIsConnected }) {
  const startgame = () => {
    socket.emit("join-room", { roomID: roomID });
  };

  const onRoomJoined = ({ roomID }) => {
    setRoomID(roomID);
    setIsConnected(true);
  };

  const onRoomFull = ({ roomID }) => {
    console.log(`Room ${roomID} is full, try another...`);
    // alert(`Room ${roomID} is full, try another...`);
  };

  useEffect(() => {
    socket.on("room-joined", onRoomJoined);
    socket.on("room-full", onRoomFull);

    return () => {
      socket.off("room-joined", onRoomJoined);
      socket.off("room-full", onRoomFull);
    };
  }, []);

  return (
    <div className="StartGame">
      <input
        type="text"
        value={roomID}
        onChange={(evt) => setRoomID(evt.target.value)}
        placeholder="Enter Room ID"
        onKeyUp={(event) => {
          if (event.key === "Enter") {
            startgame();
          }
        }}
      />
      <button onClick={startgame}>Start</button>
    </div>
  );
}
