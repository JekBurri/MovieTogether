import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

export const socket = io("http://localhost:3000");

type Message = {
  message:string,
  sender:string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [me, setMe] = useState<any>("");
  const [movie, setMovie] = useState<any>({});
  const [myMessage, setMyMessage] = useState({
    message: "",
    sender: "",
  });

  const handlePlay = (e: Event) => {
    socket.emit("play video", (e.target as HTMLVideoElement).currentTime);
  };

  const handlePause = (e: Event) => {
    socket.emit("pause video", (e.target as HTMLVideoElement).currentTime);
  };

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket);
      setMe(socket.id);
      setMyMessage((prev) => ({ ...prev, sender: socket.id || "" }));
      Swal.fire(
        "This site uses automatic video playback, please allow it to play the video."
      );
    });

    socket.on("updatemessages", (messages) => {
      setMessages(messages);
    });
    socket.on("updatemovie", (movie) => {
      setMovie(movie);
      socket.emit("updatemovie");
    });
    socket.on("play video", (room) => {
      (document.querySelector("video") as HTMLVideoElement).currentTime =
        room.timestamp;
      (document.querySelector("video") as HTMLVideoElement).play();
    });
    socket.on("pause video", (room) => {
      (document.querySelector("video") as HTMLVideoElement).currentTime =
        room.timestamp;
      (document.querySelector("video") as HTMLVideoElement).pause();
    });
  }, []);

  return (
    <div className="flex justify-center w-full h-screen">
      <div className="flex flex-col border border-gray-300 w-full rounded">
        <div className="bg-blue-600 text-white p-4 rounded-t">
          <p>Watch Together</p>
        </div>
        <div className="flex justify-between p-4 border-b border-gray-300">
          <video
            // @ts-ignore
            onPlay={handlePlay}
            // @ts-ignore
            onPause={handlePause}
            controls
            src="http://localhost:3000/video"
            className="w-3/4"
          />
          <div className="w-1/4 border-l border-gray-300 pl-4">
            <div className="max-h-80 overflow-y-auto overflow-hidden">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`border border-gray-300 rounded p-2 mb-2 ${
                    // @ts-ignore
                    message.sender === me ? "self-end bg-green-100" : ""
                  }`}
                >
                  <p className="font-semibold">
                    {message.sender === me ? "You" : message.sender}
                  </p>
                  <p>{message.message}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-300 mt-4 flex flex-col h-full">
              {/* Chat input field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  socket.emit("sendmessage", myMessage);
                  setMyMessage((prev) => ({ ...prev, message: "" }));
                }}
                className="flex-grow"
              >
                <div className="flex flex-col h-full">
                  <input
                    value={myMessage.message}
                    onChange={(e) =>
                      setMyMessage((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    type="text"
                    placeholder="Type your message..."
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <button
                    type="submit"
                    className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
