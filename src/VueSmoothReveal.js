import ImagesLoaded                   from 'imagesloaded'
import { RevealTarget }               from './RevealTarget.js'
import { VueComponentActivatedMixin } from './VueComponentActivatedMixin.js'

/**
 * @typedef  {object} VueSmoothRevealOptions
 * @property {{top: Number, right: Number, bottom: Number, left: Number}} offset
 * @property {Array<Number>} distances
 * @property {Array<Number>} delays
 * @property {Number} duration
 * @property {String} easing
 */

/**
 * Handles smooth revelation of DOM elements inspired by https://github.com/scrollreveal/scrollreveal
 * @property {options} VueSmoothRevealOptions
 * @property {IntersectionObserverInit} intersectionObserverOptions
 */
class SmoothReveal {

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
      easing: 'cubic-bezier(0.5, 0, 0, 1)'
    }
  }

  /***
   * Merge the user defined options with the default options
   * @param {VueSmoothRevealOptions} options
   */
  setOptions (options) {
    const defaultOptions = this.getDefaultOptions()

    if (!options) {
      this.options = defaultOptions
    } else {
      options.offset = Object.assign({}, options.offset, defaultOptions.offset)
      this.options   = Object.assign({}, defaultOptions, options)
    }

    this.intersectionObserverOptions = {
      rootMargin: `${this.options.offset.top}px ${this.options.offset.right}px ${this.options.offset.bottom}px ${this.options.offset.left}px`
    }
  }

  /**
   * Check if the directive binding is valid
   *
   * @param {DirectiveBinding} binding
   * @return {boolean}
   */
  bindingIsValid (binding) {
    const validValue    = typeof binding.value === 'undefined' || binding.value === true
    const validArgument = binding.arg && binding.arg.length === 3 && binding.arg.match(/[lrtb][0-9]*[a-z]/) !== null

    return validValue && validArgument
  }

  /**
   *
   * @param {RevealTarget} revealTarget
   * @return {IntersectionObserverCallback}
   */
  getIntersectionObserverCallback (revealTarget) {

    /**
     * @param {IntersectionObserverEntry[]} entries
     * @param {IntersectionObserver} observer
     */
    return function (entries, observer) {
      if (entries[0].isIntersecting) {
        observer.disconnect()
        revealTarget.reveal()
      }
    }
  }

  /**
   * Check the directive binding and start listening for the component activated event
   *
   * @param {HTMLElement} element
   * @param {DirectiveBinding} binding
   * @param {VNode} vnode
   */
  vueComponentInserted (element, binding, vnode) {
    if (!this.bindingIsValid(binding)) {
      return
    }

    const $self        = this
    const revealTarget = new RevealTarget(element, binding, vnode, $self.options)
    revealTarget.hideElement()

    if (binding.modifiers.wait) {
      vnode.context.$once('sr-ready', function () {
        $self.listenAndObserve(revealTarget)
      })

      return
    }

    vnode.context.$nextTick(function () {
      new ImagesLoaded(
        revealTarget.getImagesLoadedElement(), function () {
          $self.listenAndObserve(revealTarget)
        })
    })
  }

  /**
   * Wait until the component activates, then start observing the node
   *
   * @param {RevealTarget} revealTarget
   */
  listenAndObserve (revealTarget) {
    const $self = this

    $self.startObserving(revealTarget)

    revealTarget.vnode.context.$on('sr-activated', function () {
      revealTarget.hideElement()
      $self.startObserving(revealTarget)
    })
  }

  /**
   * Start observing the node
   *
   * @param {RevealTarget} revealTarget
   */
  startObserving (revealTarget) {
    const observer = new IntersectionObserver(
      this.getIntersectionObserverCallback(revealTarget),
      this.intersectionObserverOptions
    )

    observer.observe(revealTarget.element)
  }

  /**
   * Add a mixin and a directive
   *
   * @param {VueConstructor} Vue
   * @param {object} options
   */
  install (Vue, options) {
    this.setOptions(options)

    Vue.mixin(VueComponentActivatedMixin)

    Vue.directive('smooth-reveal', {
      inserted: this.vueComponentInserted.bind(this),
    })
  }
}

export const VueSmoothReveal = new SmoothReveal()
