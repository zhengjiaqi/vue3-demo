import AgoraRTC from 'agora-rtc-sdk'
import EventEmitter from 'events'


interface RTCClientOption {
	appid: string;
	channel: string;
  uid: number;
  token: string
}

class RTCClient {
  private option: RTCClientOption;
  private client: AgoraRTC.Client | null;
  private localStream: AgoraRTC.Stream;
  private _eventBus: EventEmitter.EventEmitter;

  constructor() { 
    // Options for joining a channel
    this.option = {
      appid: '',
      channel: '',
      uid: 0,
      token: '',
    }
    this.client = null;
    this.localStream = null as unknown as AgoraRTC.Stream;
    // @ts-ignore
    this._eventBus = new EventEmitter()
  }

  //init client and Join a channel
  joinChannel(option: RTCClientOption) {
    return new Promise((resolve, reject) => {
      this.client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"})
      this.client.init(option.appid, () => { 
        console.log("init success")
        this.clientListener()
        // @ts-ignore
        this.client && this.client.join(option.token ? option.token : null, option.channel, null, (uid: number) => {
          console.log("join channel: " + this.option.channel + " success, uid: ", uid)
          this.option = {
            appid: option.appid,
            token: option.token,
            channel: option.channel,
            uid: uid,
          }
          resolve('')
        }, (err) => {
          reject(err)
          console.error("client join failed", err)
        })
      }, (err) => {
        reject(err)
        console.error(err)
      })
      console.log("[agora-vue] appId", option.appid)
     })
  }

  publishStream(): Promise<AgoraRTC.Stream> {
    return new Promise((resolve, reject) => {
      // Create a local stream
      this.localStream = AgoraRTC.createStream({
        streamID: this.option.uid,
        audio: true,
        video: true,
        screen: false,
      })
      // Initialize the local stream
      this.localStream.init(() => {
        console.log("init local stream success") 
        resolve(this.localStream)
        // Publish the local stream
        this.publish();
      }, (err) => {
        reject(err)
        console.error("init local stream failed ", err)
      })
    })
  }

  publish() {
    return new Promise((resolve, reject) => {
      this.client && this.client.publish(this.localStream, (err) =>  {
        console.log("publish failed")
        console.error(err)
        reject(err)
      })
      resolve('');
    })
  }

  muteAudio() {
    return this.localStream.muteAudio();
  }

  unmuteAudio() {
    return this.localStream.unmuteAudio();
  }

  clientListener() {
    const client = this.client
    if(!client) {
      return;
    }
    client.on('stream-added', (evt) => {
      // The stream is added to the channel but not locally subscribed
      this._eventBus.emit('stream-added', evt)
    })
    client.on('stream-subscribed', (evt) => {
      this._eventBus.emit('stream-subscribed', evt)
    })
    client.on('stream-removed', (evt) => {
      this._eventBus.emit('stream-removed', evt)
    })
    client.on('peer-online', (evt) => {
      this._eventBus.emit('peer-online', evt)
    })
    client.on('peer-leave', (evt) => {
      this._eventBus.emit('peer-leave', evt)
    })
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    this._eventBus.on(eventName, callback)
  }

  leaveChannel() {
    return new Promise((resolve, reject) => {
      if(!this.client) {
        return;
      }
      // Leave the channel
      this.unpublish();
      this.client.leave(() => {
        // Stop playing the local stream
        if (this.localStream.isPlaying()) {
          this.localStream.stop()
        }
        // Close the local stream
        this.localStream.close()
        this.client = null
        resolve('')
        console.log("client leaves channel success");
      }, (err) => {
        reject(err)
        console.log("channel leave failed");
        console.error(err);
      })
    })
  }

  unpublish() {
    return new Promise((resolve, reject) => {
      if(!this.client) {
        return;
      }
      // Leave the channel
      this.client.unpublish(this.localStream, (err) => {
        console.log(err)
        reject(err)
      })
      resolve('');
    })
  }
}

export {
  RTCClient
} 
