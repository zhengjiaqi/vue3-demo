<template>
  <div class="agora-video-player" ref="player" :id="domId"></div>
</template>

<script lang='ts'>
import { onMounted, nextTick, onBeforeUnmount } from 'vue'
import AgoraRTC from 'agora-rtc-sdk'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'stream-player',
  props: [
    'stream',
    'domId',
  ],

  setup(props) { 
    onMounted(() => {
      nextTick(function () {
        if (props.stream && !props.stream.isPlaying()) {
          props.stream.play(`${props.domId}`, {fit: 'cover'}, (err: AgoraRTC.StreamPlayError) => {
            if (err && err.status !== 'aborted') {
              console.warn('trigger autoplay policy')
            }
          })
        }
      })
    })

    onBeforeUnmount(() => {
      if (props.stream) {
        if (props.stream.isPlaying()) {
          props.stream.stop()
        }
        props.stream.close()
      }
    })
  }
})
</script>

<style>
.agora-video-player {
  height: 100%;
  width: 100%;
}
</style>