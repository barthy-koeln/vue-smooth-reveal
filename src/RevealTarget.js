import {
  fromString as matrixFromString,
  multiply as matrixMultiply,
  scale as matrixScale,
  toString as matrixToString,
  translate as matrixTranslate
} from 'rematrix'

const BUFFER_TIME = 100

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

    this.intersectionObserverCallback = this.intersectionObserverCallback.bind(this)
  }

  /**
   * Calculate the transformation matrix
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
  prepareElement () {
    const $self = this

    return new Promise(function (resolve) {
      const transitionOptions = `${$self.duration}ms ${$self.easing}`

      const computedStyle = window.getComputedStyle($self.element)
      $self.initialTransform = computedStyle.transform
      $self.initialOpacity = computedStyle.opacity

      $self.calcOffsetTransform()

      $self.element.style.opacity = '0'
      $self.element.style.transform = $self.offsetTransform

      window.requestAnimationFrame(function () {
        $self.element.style.transition = `transform ${transitionOptions}, opacity ${transitionOptions}`

        resolve()
      })
    })
  }

  /**
   * Reveal the element
   *
   * @return {Promise<void>}
   */
  revealElement () {
    const $self = this

    return new Promise(function (resolve) {
      setTimeout(function () {
        window.requestAnimationFrame(function () {
          $self.element.style.visibility = 'visible'
          $self.element.style.transform = $self.initialTransform
          $self.element.style.opacity = $self.initialOpacity
          resolve()
        })
      }, $self.delay)
    })
  }

  /**
   * Clean up the DOM
   *
   * @return {Promise<void>}
   */
  resetElement () {
    const $self = this

    return new Promise(function (resolve) {
      setTimeout(function () {
        window.requestAnimationFrame(function () {
          $self.element.style.removeProperty('transition')
          $self.element.style.removeProperty('transform')
          $self.element.style.removeProperty('opacity')
          resolve()
        })
      }, $self.duration + BUFFER_TIME)
    })
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
      this.baseElement = this.element.closest('.sr-base')
      return this.baseElement
    }

    this.baseElement = this.element
    return this.baseElement
  }

  getImagesLoadedElement () {
    if (this.imagesLoadedElement) {
      return this.imagesLoadedElement
    }

    if (Object.prototype.hasOwnProperty.call(this.modifiers, 'first')) {
      this.imagesLoadedElement = this.getBaseElement().querySelector('.sr-first-image')
      return this.imagesLoadedElement
    }

    this.imagesLoadedElement = this.getBaseElement()
    return this.imagesLoadedElement
  }

  /**
   * @param {IntersectionObserverEntry[]} entries
   * @param {IntersectionObserver} observer
   */
  intersectionObserverCallback (entries, observer) {
    if (entries[0].isIntersecting) {
      observer.disconnect()
      this.reveal()
    }
  }

  /**
   * Chain all necessary steps
   *
   * @return {Promise<void>}
   */
  async reveal () {
    await this.prepareElement()
    await this.revealElement()
    await this.resetElement()
  }
}
