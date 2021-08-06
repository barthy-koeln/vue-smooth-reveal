import { SmoothReveal } from '../src/SmoothReveal.js'
import { createApp } from 'vue'
import App from './App.vue'

const distances = [30, 60]
const delays = [100, 350, 500]

document.addEventListener('DOMContentLoaded', function (){
  createApp(App, { distances, delays })
    .use(new SmoothReveal(), {
      threshold: .5,
      offset: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      distances,
      delays,
      duration: 600,
      easing: 'cubic-bezier(0.5, 0, 0, 1)'
    })
    .mount('#app')
})