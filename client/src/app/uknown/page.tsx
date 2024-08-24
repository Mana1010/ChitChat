"use client";
import { Socket } from "dgram";
import { useEffect, useState } from "react";
import { socket } from "@/utils/socket";
import { toast } from "sonner";
type MessageSchema = { name: any; content: string };
type Data = {
  messages: MessageSchema[];
};
export default function Home() {
  const [message, sendMessage] = useState("");
  const [room, setRoom] = useState("");
  const [currentRoom, setCurrentRoom] = useState("Public");
  const [messages, setMessages] = useState<MessageSchema[]>([]);
  const [connectedUser, setConnectedUser] = useState("");
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (!isConnected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    socket.on("chat_message", (data) => {
      setMessages(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <main className=" w-full h-screen bg-[#1F2227] space-y-2 px-10 flex flex-col py-3">
      <header className="flex items-center justify-between">
        <h1 className="text-[#DCDCDC] text-3xl font-extrabold">CHAT APP</h1>
        {connectedUser && (
          <p className="text-yellow-500 font-extrabold text-[0.6rem]">
            {connectedUser}
          </p>
        )}
        <div className="flex space-x-1 text-white">
          <h6 className="text-yellow-500 font-semibold">Room:</h6>
          <span>{currentRoom}</span>
        </div>
      </header>
      <div className="w-full flex-grow py-10 shadow-md shadow-black px-3 overflow-y-auto">
        <div className="flex flex-col space-y-1">
          {messages.map((message: MessageSchema, index) => (
            <div key={index} className="flex items-center space-x-2">
              <h6 className="font-semibold text-yellow-400 text-sm">
                {message.name}:
              </h6>{" "}
              <span className="text-white text-sm">{message.content}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 space-x-2 items-center justify-center w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            socket.emit("chat_message", message, currentRoom);
            setMessages([...messages, { name: socket.id, content: message }]);
            sendMessage("");
          }}
          className="flex space-y-2 flex-grow w-full flex-col"
        >
          <input
            onChange={(e) => sendMessage(e.target.value)}
            value={message}
            required
            type="text"
            placeholder="Send message"
            className="py-2.5 px-2 rounded-sm"
          />
          <button
            type="submit"
            className="py-2 px-3 bg-blue-500 text-white rounded-sm"
          >
            SEND
          </button>
        </form>
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              socket.emit("join_room", room, (message: any) => {
                setConnectedUser(message);
              });
              setCurrentRoom(room);
              setRoom("");
              setTimeout(() => {
                setConnectedUser("");
              }, 5000);
            }}
            className="flex space-y-2 flex-grow w-full flex-col"
          >
            <input
              onChange={(e) => setRoom(e.target.value)}
              value={room}
              required
              type="text"
              placeholder="Enter Room"
              className="py-2.5 px-2 rounded-sm"
            />
            <button
              type="submit"
              className="py-2 px-3 bg-red-500 text-white rounded-sm"
            >
              JOIN
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
