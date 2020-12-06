import { RTCClient } from "../../../../common/utils/agora-rtc-client";
import { ref, computed } from 'vue'
import AgoraRTC from 'agora-rtc-sdk'
import { message, Form} from 'ant-design-vue';

interface Evt {
    stream: AgoraRTC.Stream;
    uid: string;
}

export function main() {
    const option = ref({
        appid: '',
        token: '',
        uid: 0,
        channel: '',
    });
    const rules = ref({
      appid: [{ required: true, message: 'Please input Appid', trigger: 'change' }],
      token: [{ required: true, message: 'Please input Token', trigger: 'change' }],
      channel: [{ required: true, message: 'Please input Channel Name', trigger: 'change' }],

    })
    const ruleForm = ref(Form);

    const disableJoin = ref(false);
    const published = ref(false);
    const muted = ref(false);
    const localStream = ref(null as unknown as (AgoraRTC.Stream | null));
    const remoteStreams = ref([] as AgoraRTC.Stream[]);
    const rtc = new RTCClient();

    async function joinEvent() {
      if(!ruleForm || !ruleForm.value) {
          return;
      }
      await ruleForm.value.validate()
      try {
        await rtc.joinChannel(option.value)
        message.success('Join Success');

        try {
          const stream = await rtc.publishStream();
          message.success('Publish Success');
          localStream.value = stream;
          disableJoin.value = true;
          published.value = true;
        } catch (error) {
          message.error(`Publish Failure:${error}`);
        }
      } catch (error) {
        console.log('---Join Failure---', error)
        message.error(`Join Failure:${error}`);
      }
    }

    async function leaveEvent() {
      console.log('---leaveEvent---')
      try {
        await rtc.leaveChannel();
        disableJoin.value = false;
        published.value = false;
        message.success('Leave Success');
        localStream.value = null;
        remoteStreams.value = [];
      } catch (error) {
        message.error(`Leave Failure:${error}`);
      }
    }

    async function publishEvent() {
      try {
        await rtc.publish();
        published.value = true;
        message.success('Publish Success');
      } catch (error) {
        message.error(`Publish Failure:${error}`);
      }
    }

    async function unpublishEvent() {
      try {
        await rtc.unpublish();
        published.value = false;
        message.success('Unpublish Success');
      } catch (error) {
        message.error(`Unpublish Failure:${error}`);
      }
    }

    function muteAudioEvent() {
      if(rtc.muteAudio()) {
        muted.value = true;
        message.success('muteAudio Success');
      } else {
        message.error('muteAudio Failure');
      }
    }

    function unmuteAudioEvent() {
      if(rtc.unmuteAudio()) {
        muted.value = false;
        message.success('unmuteAudio Success');
      } else {
        message.error('unmuteAudio Failure');
      }
    }

    const publishShow = computed(() => disableJoin.value && !published.value)
    const unpublishShow = computed(() => disableJoin.value && published.value)
    const muteShow = computed(() => disableJoin.value && !muted.value)
    const unmuteShow = computed(() => disableJoin.value && muted.value)

    function created() {
      rtc.on('stream-added', (evt: Evt) => {
        const stream: AgoraRTC.Stream = evt.stream;
        console.log("[agora] [stream-added] stream-added", stream.getId())
        // @ts-ignore
        rtc.client.subscribe(stream)
      })
        
      rtc.on('stream-subscribed', (evt: Evt) => {
        const stream: AgoraRTC.Stream = evt.stream;
        console.log("[agora] [stream-subscribed] stream-added", stream.getId())
        if (!remoteStreams.value.find((it) => it.getId() === stream.getId())) {
          remoteStreams.value.push(stream)
        }
      })

      rtc.on('stream-removed', (evt: Evt) => {
        const stream: AgoraRTC.Stream = evt.stream;
        console.log('[agora] [stream-removed] stream-removed', stream.getId())
        remoteStreams.value = remoteStreams.value.filter((it) => it.getId() !== stream.getId())
      }) 

      rtc.on('peer-online', (evt: Evt) => {
        message.success(`Peer ${evt.uid} is online`)
      }) 

      rtc.on('peer-leave', (evt: Evt) => {
        message.success(`Peer ${evt.uid} already leave`)
        remoteStreams.value = remoteStreams.value.filter((it) => it.getId() !== evt.uid)
      }) 
    }

    created();

    return {
      option,
      disableJoin,
      localStream,
      remoteStreams,
      joinEvent,
      leaveEvent,
      publishEvent,
      unpublishEvent,
      muteAudioEvent,
      unmuteAudioEvent,
      rules,
      ruleForm,
      published,
      publishShow,
      unpublishShow,
      muteShow,
      unmuteShow
    }
}