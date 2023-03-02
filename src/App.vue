<!--suppress TypeScriptUnresolvedVariable, TypeScriptUnresolvedFunction -->
<template>
  <div>
    <h1>Hi</h1>
    <button @click="cast">Cast</button>
    <button @click="play">Play</button>
    <button @click="end">End</button>
    <pre
      v-text="
        JSON.stringify(
          $data,
          null,
          2
        )
      "
    />
  </div>
</template>

<script lang="ts">

export default {
  name: "App",
  setup() {
    return {};
  },
  data() {
    return {
      state: "init",
      error: null,
      castContext: null,
      castSession: null
    };
  },
  async mounted() {
    try {
      this.state = "waiting";
      await this.waitForCast();
      this.state = "init";
      await this.initCast();
      this.state = "ready";
      await this.cast();
      this.state = "cast";
    } catch (err) {
      this.error(err)
    }
  },
  methods: {
    async waitForCast() {
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          if (window["cast"] && window["cast"].framework) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
        window["__onGCastApiAvailable"] = function(loaded, errorInfo) {
          if (loaded) {
            clearInterval(interval);
            resolve();
          } else {
            clearInterval(interval);
            reject(errorInfo);
          }
        };
      });
    },
    async initCast() {
      this.castContext = window["cast"].framework.CastContext.getInstance();
      this.castContext.setOptions({
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
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
        const player = new cast.framework.RemotePlayer();
        const controller = new cast.framework.RemotePlayerController(player);
        const mediaInfo = new chrome.cast.media.MediaInfo(
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
    error(err) {
      console.error(err);
      this.error = `${err.message || err} during ${this.state}`;
      this.state = "error";
    }
  }
};
</script>

<style lang="less" scoped>

</style>
