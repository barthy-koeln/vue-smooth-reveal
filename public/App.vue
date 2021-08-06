<template>
  <div class="app">
    <div class="intro">
      <h1 v-smooth-reveal="'b1a'">VueSmoothReveal - Vue.js plug-in inspired by scrollreveal/scrollreveal.</h1>
      <p
        v-smooth-reveal="'b1b'"
      >Scroll down to reach more smooth-reveal elements!</p>
      <div
        class="github-buttons"
        v-smooth-reveal="'b1c'"
      >
        <a
          class="github-button"
          href="https://github.com/barthy-koeln/vue-smooth-reveal"
          data-size="large"
          aria-label="Star barthy-koeln/vue-smooth-reveal on GitHub"
        >barthy-koeln/vue-smooth-reveal
        </a>

        <a
          class="github-button"
          href="https://github.com/sponsors/barthy-koeln"
          data-icon="octicon-heart"
          data-size="large"
          aria-label="Sponsor @barthy-koeln on GitHub"
        >Sponsor
        </a>
      </div>
    </div>
    <template v-for="delay in ['a', 'b', 'c']">
      <div class="boxes">
        <template v-for="direction in ['l', 't', 'b', 'r']">
          <div
            class="box"
            v-smooth-reveal="direction + (['l', 'b'].includes(direction) ? '1' : '2') + delay"
          >{{ direction + (['l', 'b'].includes(direction) ? '1' : '2') + delay }}</div>
        </template>
      </div>

      <template v-if="delay !== 'c'">
        <div class="reference"></div>
      </template>
    </template>
  </div>
</template>

<script>
  export default {

    props: {
      delays: {
        type: Array,
        required: true
      },
      distances: {
        type: Array,
        required: true
      }
    },

    computed: {
      settings () {
        const entries = new Map()
        const baseCharCode = 'a'.charCodeAt(0)
        const labels = ['short', 'long']

        for (let distanceIndex = 0; distanceIndex < this.distances.length; distanceIndex++) {
          for (let delayIndex = 0; delayIndex < this.delays.length; delayIndex++) {
            const delayChar = String.fromCharCode(baseCharCode + delayIndex)
            const key = `${distanceIndex + 1}${delayChar}`

            entries.set(key, {
              distance: labels[distanceIndex],
              delay: labels[delayIndex]
            })
          }
        }

        return entries
      }
    }
  }
</script>