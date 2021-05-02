"use strict";
import { io } from "socket.io-client";
import { WebRtcPeer } from "kurento-utils";

class SignalApp {
  constructor() {
    this.socket = io("https://localhost:8443");
    this.roomName = "";
    this.userName = "";
    this._participants = {};
    this.video = null;
    this.user = {};

    this.socket.emit("message", {
      event: "createUser",
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

  requestRoom(userName) {
    this.userName = userName;

    this.socket.emit("message", {
      event: "createRoom",
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
    let video = document.createElement("video");
    video.id = userid;
    video.autoplay = true;

    let user = {
      id: userid,
      username: username,
      video: video,
      rtcPeer: null,
    };

    this._participants[user.id] = user;

    console.log(this._participants);

    const options = {
      remoteVideo: video,
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
    let video = document.createElement("video");
    video.id = userid;
    video.autoplay = true;

    let user = {
      id: userid,
      username: this.userName,
      video: video,
      rtcPeer: null,
    };

    this._participants[user.id] = user;

    let options = {
      localVideo: video,
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

    existingUsers.forEach(function (existingUser) {
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
