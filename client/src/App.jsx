import React, { useEffect, useState } from "react"
import io from "socket.io-client";

const socket = io("https://virtual-chat.onrender.com/");

export default function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socket.on("message", receiveMessage);
    socket.on("typing", (user) => {
      setIsTyping(user !== username);
    });
    socket.on("stopTyping", (user) => {
      setIsTyping(false);
    });

    return () => {
      socket.off("message", receiveMessage);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [username]);

  const receiveMessage = (message) => setMessages((state) => [message, ...state]);

  const joinChat = () => {
    if (username) {
      socket.emit("join", username);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  const handleStopTyping = () => {
    socket.emit("stopTyping", username);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username || !message) {
      return;
    }
    const newMessage = {
      body: message,
      from: username,
    };
    setMessages((state) => [newMessage, ...state]);
    setMessage("");
    socket.emit("message", newMessage.body);
    handleStopTyping();
  };

  return (
    <div className="h-screen bg-zinc-800 text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-zinc-900 p-10">
        <h1 className="text-2xl font-bold my-2">Virtual chat</h1>
        <input
          name="username"
          type="text"
          placeholder="Enter your username..."
          onChange={(e) => setUsername(e.target.value)}
          className="border-2 border-zinc-500 p-2 w-full text-black my-2"
          value={username}
        />
        <button
          type="button"
          onClick={joinChat}
          className="bg-sky-500 text-white p-2 rounded-md my-3"
          disabled={!username}
        >
          Ingresar al chat
        </button>
        <input
          name="message"
          type="text"
          placeholder="Write your message..."
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onBlur={() => handleStopTyping()}
          className="border-2 border-zinc-500 p-2 w-full text-black"
          value={message}
          autoFocus
        />
        <button
          type="submit"
          className="bg-sky-500 text-white p-2 rounded-md my-3"
          disabled={!username || !message}
        >
          Enviar
        </button>
        {isTyping && <p className="text-white">Typing...</p>}
        <ul className="h-80 overflow-y-auto">

          {messages.map((message, index) => (
            <li
              key={index}
              className={`my-2 p-2 table text-sm rounded-md ${message.from === username ? "bg-sky-700 ml-auto" : "bg-black"
                }`}
            >

              <b>{message.from}</b>: {message.body}
            </li>
          ))}
        </ul>

      </form>
    </div>
  );
}
