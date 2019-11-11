/**
 * Mixin that emits an event once the component activates
 *
 * @type {ComponentOptions<Vue>}
 */
export const VueComponentActivatedMixin = {

  activated: this.vueComponentActivated,

  /**
   * Emit an event once the component activates
   */
  vueComponentActivated () {
    this.$emit('sr-activated')
  },

}
