# Vue Smooth Reveal Plug-In

[![DeepScan grade](https://deepscan.io/api/teams/11039/projects/14032/branches/250987/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=11039&pid=14032&bid=250987)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Vue.js plug-in inspired by [scrollreveal/scrollreveal](https://github.com/scrollreveal/scrollreveal).

## Usage

```js
import Vue                 from 'vue'
import { SmoothReveal } from 'vue-smooth-reveal'

Vue.use(new SmoothReveal(), {
  threshold: .5,
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
    <div class="smooth-reveal-hidden"
         v-smooth-reveal:r1a
    ></div>
</template>
```

The binding argument consists of \[direction\]\[distance\]\[delay\].
The example above, `v-smooth-reveal:r1a`, reveals an element from the `right`, a distance `1` of `30px` and a delay `a` of `100ms`.

## Options

You can define all options shown below. The snippet above also shows the default values.
You can add up to 26 different distances and delays. They will respectively be referenced using 1-26 and a-z.

| Name        | Type     | Default                                  | Description                                                                                                                                                |
|-------------|----------|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `threshold` | Number   | `0.5`                                    | How much of the element must be in the viewport before the element is revealed. This corresponds to the  `threshold` option of the `IntersectionObserver`. |
| `offset`    | Object   | `{top: 0, right: 0, bottom: 0, left: 0}` | Offset values corresponding to the `rootMargin` options of the `IntersectionObserver`.                                                                     |
| `distances` | Number[] | `[30, 60]`                               | Distances in **pixels**. Each distance is mapped to an index starting at `1`.                                                                              |
| `delays`    | Number[] | `[100, 350]`                             | Delays in **milliseconds**. Each delay is mapped to a letter starting at `a`.                                                                              |
| `duration`  | Number   | `600`                                    | Duration of the animations in **milliseconds**.                                                                                                            |
| `easing`    | String   | `cubic-bezier(0.5, 0, 0, 1)`             | CSS animation easing.                                                                                                                                      |

## Conditionally Reveal

Use the directive value to decide if the smooth reveal should be applied.
If the value is false, the element will not be handled and you must add the 'revealed' class or styles yourself, if the element should still be visible:

```Vue
<div class="smooth-reveal-hidden"
     :class="{'revealed': someCondition}"
     v-smooth-reveal:r1a="!someCondition"
></div>
```

## Custom Revelation Event

If you use the `wait` modifier, the plug-in will wait for the `smooth-reveal-ready` event to be emitted on the specified base (using the css class `.smooth-reveal-base`) before revealing, even if it is already in the viewport.

```Vue
<template>
    <div class="smooth-reveal-base">
        <div class="smooth-reveal-hidden"
            v-smooth-reveal:r1a.wait
        >
        </div>
    </div>
</template>
```

## ImagesLoaded

The plug-in will automatically wait for all contained images to be loaded before revealing, even if it is already in the viewport.
If you want to reveal an element once one of its parent's contained images load, add the `.smooth-reveal-base` class and use the following modifiers:

```Vue
<template>
    <div class="smooth-reveal-base">
        <div class="smooth-reveal-hidden"
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
.smooth-reveal-hidden {
    visibility: hidden;

    &.revealed {
        visibility: visible;
    }
}
```
