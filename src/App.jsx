import "./App.css";
import Board from "./components/Board";
import StartGame from "./components/StartGame";
import { useEffect, useState } from "react";
import { socket } from "./socket";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomID, setRoomID] = useState("");

  const onRoomLeft = () => {
    alert("Other Player left!");
    setIsConnected(false);
  };

  useEffect(() => {
    socket.on("room-left", onRoomLeft);
    return () => {
      socket.off("room-left", onRoomLeft);
    };
  }, []);

  return (
    <>
      {isConnected ? (
        <Board roomID={roomID} setIsConnected={setIsConnected} />
      ) : (
        <StartGame
          setIsConnected={setIsConnected}
          roomID={roomID}
          setRoomID={setRoomID}
        />
      )}
    </>
  );
}

export default App;
