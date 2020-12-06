<template>
  <a-form ref="ruleForm" :model="option" :rules="rules" layout="horizontal" :label-col="{span: 4}">
    <a-form-item label="Appid" name="appid">
      <a-input v-model:value="option.appid" placeholder="Appid" />
    </a-form-item>
    <a-form-item label="Token" name="token">
      <a-input v-model:value="option.token" placeholder="Token"/>
    </a-form-item>
    <a-form-item label="Channel Name" name="channel">
      <a-input v-model:value="option.channel" placeholder="Channel Name"/>
    </a-form-item>
    <a-button type="primary" class="button" @click="joinEvent" :disabled='disableJoin'>join</a-button>
    <a-button type="primary" class="button" @click='leaveEvent' :disabled='!disableJoin'>leave</a-button>
    <a-button type="primary" class="button" @click="publishEvent" :disabled='!publishShow'>publish</a-button>
    <a-button type="primary" class="button" @click='unpublishEvent' :disabled='!unpublishShow'>unpublish</a-button>
    <a-button type="primary" class="button" @click="muteAudioEvent" :disabled='!muteShow'>muteAudio</a-button>
    <a-button type="primary" class="button" @click='unmuteAudioEvent' :disabled='!unmuteShow'>unmuteAudio</a-button>
  </a-form>
  <div class="agora-view">
    <div class="agora-video">
      <StreamPlayer :stream="localStream" :domId="localStream.getId()" v-if="localStream"></StreamPlayer>
    </div>
    <div class="agora-video" :key="index" v-for="(remoteStream, index) in remoteStreams">
      <StreamPlayer :stream="remoteStream" :domId="remoteStream.getId()"></StreamPlayer>
    </div>
  </div>   
</template>

<script lang='ts'>
import StreamPlayer from "../stream-player.vue";
import { defineComponent } from 'vue';
import { main } from './index';

export default defineComponent({
  setup() {
    const res = main();
    return {
      ...res
    }
  },
  components: {
    StreamPlayer
  }
})
</script>

<style scoped>
  .agora-view {
    display: flex;
    flex-wrap: wrap;
  }
  .agora-video {
    width: 320px;
    height: 240px;
    margin: 20px;
  }
  .button{
    margin-left: 10px;
  }
</style>
