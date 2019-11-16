# Vue Smooth Reveal Plug-In

Vue.js plug-in inspired by [scrollreveal/scrollreveal](https://github.com/scrollreveal/scrollreveal).

## Usage

```js
import Vue                 from 'vue'
import { VueSmoothReveal } from 'vue-smooth-reveal'

Vue.use(VueSmoothReveal, {
  offset: {
    top: 0,
      right: 0,
      bottom: 0,
      left: 0
    },
    distances: [30, 60],
    delays: [100, 350],
    duration: 600,
    easing: 'cubic-bezier(0.5, 0, 0, 1)'
})
```

```vue
<template>
    <div class="sr-hidden"
         v-smooth-reveal:r1a
    ></div>
</template>
```

The binding argument consists of \[direction\]\[distance\]\[delay\].

## Options

You can define all options shown above. The snippet above also show the default values.
You can add up to 26 different distances and delays. The will respectively be referenced using 1-26 and a-z.

## Conditionally Reveal

Use the directive value to decide if the smooth reveal should be applied.
If the value is false, the element will not be handled and you must add the 'revealed' class or styles yourself:

```Vue
<div class="sr-hidden"
     :class="{'revealed': someCondition}"
     v-smooth-reveal:r1a="!someCondition"
></div>
```

## Custom Revelation Event

If you use the `wait` modifier, the plug-in will wait for the `sr-ready` event to be emitted on the specified base before revealing, even if it is already in the viewport.

```Vue
<template>
    <div class="sr-base">
        <div class="sr-hidden"
            v-smooth-reveal:r1a.wait
        >
        </div>
    </div>
</template>
```

## ImagesLoaded

The plug-in will automatically wait for all contained images to be loaded before revealing, even if it is already in the viewport.
If you want to reveal an element once one of its parent's contained images load, add the `.sr-base` class and use the following modifiers:

```Vue
<template>
    <div class="sr-base">
        <div class="sr-hidden"
            v-smooth-reveal:r1a.parent
        >
            <img src="/image.jpg" alt="the div will only reveal once this image is loaded">
        </div>
        
        <img src="/image.jpg" alt="the div will only reveal once this image is loaded">
    </div>
</template>
```

## Initial state

In order to hide all elements that will be revealed later, add the following to your stylesheet:

```SCSS
.sr-hidden {
    visibility: hidden;

    &.revealed {
        visibility: visible;
    }
}
```
