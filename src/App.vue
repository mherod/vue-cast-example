<!--suppress TypeScriptUnresolvedVariable, TypeScriptUnresolvedFunction -->
<template>
  <div>
    <h1>Hi</h1>
    <h2 v-text="state"></h2>
    <button :disabled="state !== 'ready'" @click="cast">Cast</button>
    <button :disabled="state !== 'ready'" @click="play">Play</button>
    <button :disabled="state !== 'ready'" @click="end">End</button>
    <pre v-text="JSON.stringify($data, null, 2)" />
  </div>
</template>

<script lang="ts">
import { useScriptTag } from "@vueuse/core";
import { waitForCast } from "./cast-helper";

function error(err) {
  console.error(err);
  this.error = `${err.message || err} during ${this.state}`;
  this.state = "error";
}

export default {
  name: "App",
  setup() {
    return {
      castScriptTag: useScriptTag(
        "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
      ),
      cast: null,
    };
  },
  data() {
    return {
      state: "init",
      error: null,
      castContext: null,
      castSession: null,
    };
  },
  async mounted() {
    if (!window["chrome"]) {
      this.error = "Not Chrome";
      return;
    }
    try {
      this.state = "loading";
      await this.castScriptTag.load();
      this.state = "init";
      await this.initCast();
      this.state = "ready";
      await this.cast();
      this.state = "cast";
    } catch (err) {
      error(err);
    }
  },
  methods: {
    waitForCast: async function() {
      return await waitForCast();
    },
    async initCast() {
      this.state = "waiting";
      this.cast = await this.waitForCast();
      this.state = "init";
      this.castContext = window["cast"].framework.CastContext.getInstance();
      this.castContext.setOptions({
        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
      });
    },
    async cast() {
      try {
        this.castSession ||= this.castContext.getCurrentSession();
        this.castSession ||= await this.castContext.requestSession();
      } catch (err) {
        this.error(err);
      }
    },
    async play() {
      try {
        const player = new this.cast.framework.RemotePlayer();
        const controller = new this.cast.framework.RemotePlayerController(player);
        const mediaInfo = new window.chrome.cast.media.MediaInfo(
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          "video/mp4"
        );
      } catch (err) {
        this.error(err);
      }
    },
    async end() {
      try {
        this.castSession.endSession(true);
        this.castContext = null;
      } catch (err) {
        this.error(err);
      }
    },
    error,
  },
};
</script>

<style lang="less" scoped></style>
