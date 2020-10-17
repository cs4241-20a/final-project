import { Injectable } from '@angular/core';
import defaultExport, * as SimplePeer from 'node_modules/simple-peer/simplepeer.min.js';
import { PeerData } from '../model/PeerData.model';

@Injectable({
  providedIn: 'root'
})
export class RtcService {
  self: any;
  clients: PeerData[] = [];

  constructor() {
    this.self = new PeerData( new SimplePeer({initiator: true}) );
    this.test();
  }

  addPeer() {
    let newPeer = new SimplePeer();
    newPeer.on('signal', data => {
      this.self.peer.signal(data);
    });
    this.self.peer.on('signal', data => {
      newPeer.signal(data);
    });
    this.clients.push(new PeerData(newPeer));
  }

  connectSelf(audio: boolean, video: boolean) {
    navigator.mediaDevices.getUserMedia({
      video: video,
      audio: audio
    }).then((stream) => this.self.peer.addStream(stream)).catch(err => {
      console.error(`Error connecting media: ${err}`);
    });
  }

  connectSelfVideo() {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    }).then((stream) => {
      this.self.peer.addStream(stream);
      this.self.video = stream;
    }).catch(err => {
      console.error(`Error connecting media: ${err}`);
    });
  }

  connectSelfAudio() {
    navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true
    }).then((stream) => {
      this.self.peer.addStream(stream);
      this.self.audio = stream;
    }).catch(err => {
      console.error(`Error connecting media: ${err}`);
    });
  }

  removeSelfAudio() {
    this.self.peer.removeStream(this.self.audio);
  }

  removeSelfVideo() {
    this.self.peer.removeStream(this.self.video);
  }

  getPeerVideo(i: number) {
    this.clients[i].peer.on('stream', stream => {
      this.clients[i].video = stream;
    });
  }

  test() {
    this.addPeer();

    this.self.peer.on('connect', () => {
      // wait for 'connect' event before using the data channel
      this.self.peer.send('hey peer2, how is it going?');
    });

    this.clients[0].peer.on('data', data => {
      // got a data channel message
      console.log('got a message from peer1: ' + data);
    });
  }
}
