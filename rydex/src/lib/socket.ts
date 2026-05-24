import { io, Socket } from "socket.io-client"

let socket:Socket|null=null

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER, {
      autoConnect: false
    });

    // Fetch the secure HMAC token asynchronously, then connect
    fetch("/api/auth/socket-token")
      .then((res) => res.json())
      .then((data) => {
        if (data.token && socket) {
          socket.auth = { token: data.token };
          socket.connect();
        }
      })
      .catch((err) => console.error("Failed to fetch socket token", err));
  }
  return socket;
};