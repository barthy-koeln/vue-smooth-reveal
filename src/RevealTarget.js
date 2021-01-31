import {
  fromString as matrixFromString,
  multiply as matrixMultiply,
  scale as matrixScale,
  toString as matrixToString,
  translate as matrixTranslate
} from 'rematrix'

/**
 * Handles the smooth revelation of a DOM node
 */
export class RevealTarget {
  /**
   *
   * @param {HTMLElement} element
   * @param {Object} binding
   * @param {Object} vNode
   * @param {VueSmoothRevealOptions} options
   */
  constructor (element, binding, vNode, options) {
    this.element = element
    this.modifiers = binding.modifiers
    this.delay = options.delays[binding.arg[2].charCodeAt(0) - 97]
    this.duration = options.duration
    this.easing = options.easing
    this.distances = options.distances
    this.argument = binding.arg

    this.offsetTransform = ''

    this.hideElement()
  }

  /**
   * @return {Promise<void>}
   */
  static async sleep (delay) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, delay)
    })
  }

  /**
   * @return {Promise<void>}
   */
  static async nextFrame () {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(resolve)
    })
  }

  /**
   * Calculate the transformation matrix
   *
   * @return {void}
   */
  calcOffsetTransform () {
    const origin = this.argument[0]
    const distanceIndex = parseInt(this.argument[1], 10)
    const distance = this.distances[distanceIndex - 1]

    const x = origin === 'l' ? -distance : (origin === 'r' ? distance : 0)
    const y = origin === 't' ? -distance : (origin === 'b' ? distance : 0)

    const transform = matrixTranslate(x, y)
    const scale = matrixScale(0.99)

    const final = [
      matrixFromString(this.initialTransform),
      transform,
      scale
    ].reduce(matrixMultiply)

    this.offsetTransform = matrixToString(final)
  }

  /**
   * Hide the element
   *
   * @return {void}
   */
  hideElement () {
    this.element.style.visibility = 'hidden'
    this.element.style.transition = 'none'
  }

  /**
   * Prepare the element for revelation
   *
   * @return {Promise<void>}
   */
  async prepareElement () {
    const transitionOptions = `${this.duration}ms ${this.easing}`

    const computedStyle = window.getComputedStyle(this.element)
    this.initialTransform = computedStyle.transform
    this.initialOpacity = computedStyle.opacity

    this.calcOffsetTransform()

    this.element.style.opacity = '0'
    this.element.style.transform = this.offsetTransform

    await RevealTarget.nextFrame()
    this.element.style.transition = `transform ${transitionOptions}, opacity ${transitionOptions}`
  }

  /**
   * Reveal the element
   *
   * @return {Promise<void>}
   */
  async revealElement () {
    await RevealTarget.sleep(this.delay)
    await RevealTarget.nextFrame()

    this.element.style.visibility = 'visible'
    this.element.style.transform = this.initialTransform
    this.element.style.opacity = this.initialOpacity
  }

  /**
   * Clean up the DOM
   *
   * @return {Promise<void>}
   */
  async resetElement () {
    await RevealTarget.sleep(this.duration + 100)
    await RevealTarget.nextFrame()

    this.element.style.removeProperty('transition')
    this.element.style.removeProperty('transform')
    this.element.style.removeProperty('opacity')
  }

  /**
   * Get the element that should be used to determine if the element is ready for revelation
   *
   * @return {HTMLElement}
   */
  getBaseElement () {
    if (this.baseElement) {
      return this.baseElement
    }

    if (Object.prototype.hasOwnProperty.call(this.modifiers, 'parent')) {
      this.baseElement = this.element.closest('.smooth-reveal-base')
      return this.baseElement
    }

    this.baseElement = this.element
    return this.baseElement
  }

  /**
   * Figure out the ImagesLoaded element and cache it
   *
   * @return {HTMLElement}
   */
  getImagesLoadedElement () {
    if (this.imagesLoadedElement) {
      return this.imagesLoadedElement
    }

    if (Object.prototype.hasOwnProperty.call(this.modifiers, 'first')) {
      this.imagesLoadedElement = this.getBaseElement().querySelector('.smooth-reveal-first-image')
      return this.imagesLoadedElement
    }

    this.imagesLoadedElement = this.getBaseElement()
    return this.imagesLoadedElement
  }

  /**
   * Dispatch a CustomEvent on the base element
   *
   * @param {String} event
   * @param {any} detail
   *
   * @return {Boolean}
   */
  dispatch (event, detail = undefined) {
    return this.getBaseElement().dispatchEvent(new window.CustomEvent(event, { detail: detail }))
  }

  /**
   * Chain all necessary steps
   *
   * @return {null}
   */
  async reveal () {
    await this.prepareElement()
    await this.revealElement()
    await this.resetElement()

    return null
  }
}
