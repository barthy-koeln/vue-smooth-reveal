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
 * @property {WeakMap} imagesLoadedPromises
 */
class SmoothReveal {
  constructor () {
    this.imagesLoadedPromises = new WeakMap()
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

    const $self = this
    const revealTarget = new RevealTarget(element, binding, vNode, $self.options)
    revealTarget.hideElement()

    if (binding.modifiers.wait) {
      vNode.context.$once('sr-ready', function () {
        $self.listenAndObserve(revealTarget)
      })

      return
    }

    await vNode.context.$nextTick()
    await this.getOrCreateImagesLoadedPromise(revealTarget)

    $self.listenAndObserve(revealTarget)
  }

  /**
   *
   * @param {RevealTarget} revealTarget
   * @return {Promise<void>}
   */
  getOrCreateImagesLoadedPromise (revealTarget) {
    const imagesLoadedElement = revealTarget.getImagesLoadedElement()
    if (this.imagesLoadedPromises.has(imagesLoadedElement)) {
      return this.imagesLoadedPromises.get(imagesLoadedElement)
    }

    const promise = new Promise(function (resolve) {
      ImagesLoaded(
        revealTarget.getImagesLoadedElement(),
        function () {
          revealTarget.getBaseElement().dispatchEvent(new window.CustomEvent('images-loaded'))
          resolve()
        }
      )
    })

    this.imagesLoadedPromises.set(imagesLoadedElement, promise)

    return promise
  }

  /**
   * Wait until the component activates, then start observing the node
   *
   * @param {RevealTarget} revealTarget
   */
  listenAndObserve (revealTarget) {
    revealTarget.hideElement()
    this.startObserving(revealTarget)
  }

  /**
   * Start observing the node
   *
   * @param {RevealTarget} revealTarget
   */
  startObserving (revealTarget) {
    const observer = new window.IntersectionObserver(
      revealTarget.intersectionObserverCallback,
      this.intersectionObserverOptions
    )

    observer.observe(revealTarget.getBaseElement())
  }

  /**
   * Add a mixin and a directive
   *
   * @param {Object} Vue
   * @param {Object} options
   */
  install (Vue, options) {
    this.setOptions(options)

    Vue.directive('smooth-reveal', {
      inserted: this.vueComponentInserted.bind(this)
    })
  }
}

export const VueSmoothReveal = new SmoothReveal()
