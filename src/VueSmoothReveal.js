import ImagesLoaded from 'imagesloaded'
import { RevealTarget } from './RevealTarget.js'

/**
 * @typedef  {Object} VueSmoothRevealOptions
 * @property {{top: Number, right: Number, bottom: Number, left: Number}} offset
 * @property {Array<Number>} distances
 * @property {Array<Number>} delays
 * @property {Number} duration
 * @property {String} easing
 */

/**
 * Handles smooth revelation of DOM elements inspired by https://github.com/scrollreveal/scrollreveal
 *
 * @property {VueSmoothRevealOptions} options
 * @property {IntersectionObserverInit} intersectionObserverOptions
 * @property {WeakMap<Element, ImagesLoaded>} imagesLoadedPromises
 * @property {WeakMap<Element, RevealTarget>} targetMap
 */
class SmoothReveal {
  constructor () {
    this.imagesLoadedMap = new WeakMap()
    this.targetMap = new WeakMap()

    this.vueComponentInserted = this.vueComponentInserted.bind(this)
    this.observerCallback = this.observerCallback.bind(this)
  }

  /**
   * Default options
   *
   * @return {VueSmoothRevealOptions}
   */
  getDefaultOptions () {
    return {
      offset: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
      distances: [30, 60],
      delays: [100, 350],
      duration: 600,
      threshold: 0.5,
      easing: 'cubic-bezier(0.5, 0, 0, 1)'
    }
  }

  /***
   * Merge the user defined options with the default options
   *
   * @param {VueSmoothRevealOptions} options
   */
  setOptions (options) {
    const defaultOptions = this.getDefaultOptions()

    if (!options) {
      this.options = defaultOptions
    } else {
      options.offset = Object.assign({}, defaultOptions.offset, options.offset)
      this.options = Object.assign({}, defaultOptions, options)
    }

    /**
     * @type {IntersectionObserverInit}
     */
    this.intersectionObserverOptions = {
      threshold: this.options.threshold,
      rootMargin: `${this.options.offset.top}px ${this.options.offset.right}px ${this.options.offset.bottom}px ${this.options.offset.left}px`
    }
  }

  /**
   * Check if the directive binding is valid
   *
   * @param {Object} binding
   * @return {Boolean}
   */
  bindingIsValid (binding) {
    const validValue = typeof binding.value === 'undefined' || binding.value === true
    const validArgument = binding.arg && binding.arg.length === 3 && binding.arg.match(/[lrtb][0-9]*[a-z]/) !== null

    return validValue && validArgument
  }

  /**
   * Check the directive binding and start listening for the component activated event
   *
   * @param {HTMLElement} element
   * @param {Object} binding
   * @param {Object} vNode
   */
  async vueComponentInserted (element, binding, vNode) {
    if (!this.bindingIsValid(binding)) {
      return
    }

    const revealTarget = new RevealTarget(element, binding, vNode, this.options)
    this.targetMap.set(element, revealTarget)

    if (binding.modifiers.wait) {
      vNode.context.$once('sr-ready', () => this.observer.observe(element))

      return
    }

    await vNode.context.$nextTick()
    this.observeWhenImagesLoaded(revealTarget.getImagesLoadedElement(), element)
  }

  /**
   *
   * @param {Element} imagesLoadedElement
   * @param {Element} baseElement
   */
  observeWhenImagesLoaded (imagesLoadedElement, baseElement) {
    if (!this.imagesLoadedMap.has(imagesLoadedElement)) {
      this.imagesLoadedMap.set(imagesLoadedElement, new ImagesLoaded(imagesLoadedElement))
    }

    this.imagesLoadedMap.get(imagesLoadedElement).once('always', () => {
      baseElement.dispatchEvent(new window.CustomEvent('images-loaded'))
      this.imagesLoadedMap.delete(imagesLoadedElement)
      this.observer.observe(baseElement)
    })
  }

  /**
   * @param {IntersectionObserverEntry[]} entries
   */
  observerCallback (entries) {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue
      }

      const target = entry.target
      this.observer.unobserve(target)
      this.targetMap.get(target).reveal()
      this.targetMap.delete(target)
    }
  }

  /**
   * Add a mixin and a directive
   *
   * @param {Object} Vue
   * @param {Object} options
   */
  install (Vue, options) {
    this.setOptions(options)

    this.observer = new window.IntersectionObserver(this.observerCallback, this.intersectionObserverOptions)

    Vue.directive('smooth-reveal', {
      inserted: this.vueComponentInserted
    })
  }
}

export const VueSmoothReveal = new SmoothReveal()
