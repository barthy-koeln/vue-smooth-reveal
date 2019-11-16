import {
  fromString as matrixFromString,
  multiply as matrixMultiply,
  scale as matrixScale,
  toString as matrixToString,
  translate as matrixTranslate
}              from 'rematrix'
import miniraf from 'miniraf'

/**
 * Handles the smooth revelation of a DOM node
 */
export class RevealTarget {

  /**
   *
   * @param {HTMLElement} element
   * @param {DirectiveBinding} binding
   * @param {VNode} vnode
   * @param {VueSmoothRevealOptions} options
   */
  constructor (element, binding, vnode, options) {
    this.element   = element
    this.vnode     = vnode
    this.modifiers = binding.modifiers
    this.delay     = options.delays[binding.arg[2].charCodeAt(0) - 97]
    this.duration  = options.duration
    this.easing    = options.easing
    this.distances = options.distances
    this.argument  = binding.arg

    this.offsetTransform = ''
  }

  /**
   * Calculate the transformation matrix
   */
  calcOffsetTransform () {
    const origin        = this.argument[0]
    const distanceIndex = parseInt(this.argument[1], 10)
    const distance      = this.distances[distanceIndex - 1]

    const x = origin === 'l' ? -distance : (origin === 'r' ? distance : 0)
    const y = origin === 't' ? -distance : (origin === 'b' ? distance : 0)

    const transform = matrixTranslate(x, y)
    const scale     = matrixScale(0.99)

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
      const transformOptions = `${$self.duration}ms ${$self.easing}`

      const computedStyle    = getComputedStyle($self.element)
      $self.initialTransform = computedStyle.transform
      $self.initialOpacity   = computedStyle.opacity

      $self.calcOffsetTransform()

      $self.element.style.opacity   = '0'
      $self.element.style.transform = $self.offsetTransform

      miniraf(function () {
        $self.element.style.transition = `transform ${transformOptions}, opacity ${transformOptions}`
        $self.element.style.visibility = 'visible'
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
        $self.element.style.transform = $self.initialTransform
        $self.element.style.opacity   = $self.initialOpacity
        resolve()
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
        $self.element.style.removeProperty('transition')
        $self.element.style.removeProperty('transform')
        $self.element.style.removeProperty('opacity')
        resolve()
      }, $self.duration)
    })
  }

  /**
   * Get the element that should be used to determine if the element is ready for revelation
   *
   * @return {HTMLElement}
   */
  getImagesLoadedElement () {
    let imagesLoadedElement

    if (this.modifiers.parent === true) {
      imagesLoadedElement = this.element.closest('.sr-base')
    } else {
      imagesLoadedElement = this.element
    }

    if (this.modifiers.first) {
      imagesLoadedElement = imagesLoadedElement.querySelector('.sr-first-image')
    }

    return imagesLoadedElement
  }

  /**
   * Chain all necessary steps
   */
  reveal () {
    this.prepareElement()
      .then(this.revealElement.bind(this))
      .then(this.resetElement.bind(this))
  }
}
