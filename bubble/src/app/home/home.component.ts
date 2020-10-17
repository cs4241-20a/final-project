import { Component, HostListener, OnInit } from '@angular/core';
import { RtcService } from '../services/rtc.service';
import { Rtc2Service } from '../services/rtc2.service';
import { WebsocketService } from '../services/websocket.service';
import { Tile } from '../model/Tile.model';
import { Bubble } from '../model/Bubble.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { InfoComponent } from '../info/info.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'bbl-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [WebsocketService]
})

export class HomeComponent implements OnInit {

  CHAT_URL: string = "ws://localhost:4200";

  audio: any = null;
  video: any = null;
  mirror = true;
  focus: number = null;
  numCols = 1;
  bubbles: Bubble[] = [
    {name: 'one'},
    {name: 'two'},
    {name: 'three'},
  ]
  you: Tile = {text: 'You', cols: 1, rows: 1, color: 'lightblue', index: 0};
  tiles: Tile[] = [
    this.you,
    {text: '1', cols: 1, rows: 1, color: 'lightblue', index: 1},
    {text: '2', cols: 1, rows: 1, color: 'lightgreen', index: 2},
    {text: '3', cols: 1, rows: 1, color: 'lightpink', index: 3},
    {text: '4', cols: 1, rows: 1, color: 'lavender', index: 4},
  ]
  newBubbleForm = this._fb.group({
    newBubble: [''],
  });

  oldBubbleForm = this._fb.group({
    oldBubble: [''],
  });

  constructor(
    private _rtc: RtcService,
    private _fb: FormBuilder,
    private _rtc2: Rtc2Service,
    wsService: WebsocketService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.numCols = Math.floor(window.innerWidth / 320);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.numCols = Math.floor(event.target.innerWidth / 320);
    this.tiles[0].cols = this.numCols;
  }

  drop(event: CdkDragDrop<Bubble[]>) {
    moveItemInArray(this.bubbles, event.previousIndex, event.currentIndex);
  }


  toggleAudio() {
    if(this.audio) {
      this._rtc.removeSelfAudio();
      this.audio = null;
    }
    else {
      this._rtc.connectSelfAudio();
      this.audio = this._rtc.self.audio;
    }
  }

  toggleVideo() {
    if(this.video) {
      this._rtc.removeSelfVideo();
      this.video = null;
      let pageVideo = document.querySelector(".your-video") as HTMLVideoElement;
      pageVideo.srcObject = null;
      pageVideo.play()
    }
    else {
      this._rtc.connectSelfVideo();
      this.video = this._rtc.self.video;
      let pageVideo = document.querySelector(".your-video") as HTMLVideoElement;
      pageVideo.srcObject = this.video;
      pageVideo.play()
    }
  }

  addTile() {
    this.tiles.push({
      text: `${this.tiles.length + 1}`,
      cols: 1,
      rows: 1,
      color: 'lavender',
      index: this.tiles.length
    } as Tile)
  }

  refocus(i: number) {
    this.unfocus();
    this.focus = i;
    this.tiles[i].cols = this.numCols;
    this.tiles[i].rows = 2;
    let temp = this.tiles[i];
    this.tiles.splice(0, 0, this.tiles.splice(i, 1)[0]);
  }

  unfocus() {
    if (this.focus === null) {
      return;
    }
    this.tiles[0].cols = 1;
    this.tiles[0].rows = 1;
    this.tiles.splice(this.focus, 0, this.tiles.splice(0, 1)[0]);
    this.focus = null;
  }

  addBubble(name: string = "") {
    if(!name) {
      if (!this.newBubbleForm.get("newBubble")){
        return;
      }
      name = this.newBubbleForm.get("newBubble").value;
    }
    this.bubbles.push({
      name: name
    } as Bubble);
    this.newBubbleForm.get("newBubble").setValue('');
  }


  joinOldBubble(name: string = ""){
    if(!name) {
      if (!this.oldBubbleForm.get("oldBubble")){
        return;
      }
      name = this.oldBubbleForm.get("oldBubble").value;
    }

    for(let i=0; i<this.bubbles.length; i++){
      if(name===this.bubbles[i].name){
        this._rtc2.resetPeers(name);
        //make connection
        // fetch("usersInRoom")
        // .then(response => response.json())
        // .then(usersinroom => {
          // usersinroom.array.forEach(element => {
            //add these users who are in the room to person's screen who is just joining
            // this._rtc2.resetPeers(name);
          // });
        // })
      }
    }

  }

  activateRTC() {
    this.video = this._rtc2.self.video;
    let pageVideo = document.querySelector(".your-video") as HTMLVideoElement;
    pageVideo.srcObject = this.video;
    pageVideo.play()
    for (let i = 0; i < this._rtc2.clients.length; i++) {
      if (this.tiles.length + 1 < this._rtc2.clients.length){
        this.tiles.push({text: `${i}`, cols: 1, rows: 1, color: 'lightblue', index: i} as Tile);
      }
      this.tiles[i + 1].stream = this._rtc2.clients[i].video;
      let clientVideo = document.querySelector(`.client-${i+1}-video`) as HTMLVideoElement
      clientVideo.srcObject = this._rtc2.clients[i].video;
      clientVideo.play();
    }
  }

  debug() {
    debugger;
  }

  openDialog() {
    const dialogRef = this.dialog.open(InfoComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}
