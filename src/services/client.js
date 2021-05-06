"use strict";
import { io } from "socket.io-client";
import { WebRtcPeer } from "kurento-utils";
import adapter from "webrtc-adapter";

class SignalApp {
  constructor() {
    const regex = /(^https?):\/\/\w+(:[0-9]*)?\/?/;
    const lastIdx = regex.exec(window.location.href)[0].length;
    this._currentLocation = window.location.href.slice(lastIdx - 1);
    this.socket = io("https://localhost:8443");
    this.roomName = "";
    this.userName = "";
    this._participants = {};
    this.user = {};

    this.socket.emit("message", {
      event: "createUser",
      currRoom: this._currentLocation,
    });

    this.socket.on("message", (message) => {
      switch (message.event) {
        case "userCreated":
          this.requestRoom(message.userName);
          break;
        case "roomCreated":
          this.joinRoom(message.roomName);
          break;

        case "newParticipantArrived":
          this.receiveVideo(message.userid, message.username);
          break;

        case "existingParticipants":
          this.onExistingParticipants(message.userid, message.existingUsers);
          break;

        case "receiveVideoAnswer":
          this.onReceiveVideoAnswer(message.senderid, message.sdpAnswer);
          break;

        case "candidate":
          this.addIceCandidate(message.userid, message.candidate);
          break;

        // case "closeCall":
        //   closeCall(message);
        //   break;
      }
    });
  }

  get participants() {
    return this._participants;
  }
  get currentLocation() {
    return `${window.location.href}${this.roomName}`;
  }

  requestRoom(userName) {
    const room =
      this._currentLocation.length > 1 ? this._currentLocation.slice(1) : "";
    this.userName = userName;

    this.socket.emit("message", {
      event: "createRoom",
      room: room,
    });
  }

  joinRoom(roomName) {
    this.roomName = roomName;

    this.socket.emit("message", {
      event: "joinRoom",
      userName: this.userName,
      roomName: this.roomName,
    });
  }

  async receiveVideo(userid, username) {
    let user = {
      id: userid,
      type: "remote",
      username: username,
      rtcPeer: null,
    };

    this._participants[user.id] = user;

    const options = {
      onicecandidate: (candidate) => {
        this.socket.emit("message", {
          event: "candidate",
          userid: user.id,
          roomName: this.roomName,
          candidate: candidate,
        });
      },
    };

    user.rtcPeer = WebRtcPeer.WebRtcPeerRecvonly(options);
    user.rtcPeer.generateOffer((err, sdp) => {
      if (err) {
        console.error(err);
      }
      this.socket.emit("message", {
        event: "receiveVideoFrom",
        userid: user.id,
        roomName: this.roomName,
        sdpOffer: sdp,
      });
    });
  }

  async onExistingParticipants(userid, existingUsers) {
    let user = {
      id: userid,
      type: "local",
      username: this.userName,
      rtcPeer: null,
    };

    this._participants[user.id] = user;

    let options = {
      onicecandidate: (candidate) => {
        this.socket.emit("message", {
          event: "candidate",
          userid: user.id,
          roomName: this.roomName,
          candidate: candidate,
        });
      },
    };

    user.rtcPeer = WebRtcPeer.WebRtcPeerSendonly(options);
    user.rtcPeer.generateOffer((err, sdp) => {
      this.socket.emit("message", {
        event: "receiveVideoFrom",
        userid: user.id,
        roomName: this.roomName,
        sdpOffer: sdp,
      });
    });

    existingUsers.forEach((existingUser) => {
      this.receiveVideo(existingUser.id, existingUser.name);
    });
  }

  onReceiveVideoAnswer(senderid, sdpAnswer) {
    this._participants[senderid].rtcPeer.processAnswer(sdpAnswer);
  }

  addIceCandidate(userid, candidate) {
    this._participants[userid].rtcPeer.addIceCandidate(candidate);
  }

  // closeCall(message) {
  //   if (message == null) {
  //     for (let user in participants) {
  //       this.participants[user].rtcPeer.dispose();
  //       this.participants[user].rtcPeer = null;
  //       this.participants[user].videoContainer.remove();
  //     }
  //   } else {
  //     this.participants[message.userid].rtcPeer.dispose();
  //     this.participants[message.userid].rtcPeer = null;
  //     this.participants[message.userid].videoContainer.remove();
  //   }
  // }
}

export default SignalApp;
