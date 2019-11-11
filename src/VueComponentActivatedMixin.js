/**
 * Emit an event once the component activates
 */
function vueComponentActivated () {
  this.$emit('sr-activated')
}

/**
 * Mixin that emits an event once the component activates
 *
 * @type {ComponentOptions<Vue>}
 */
export const VueComponentActivatedMixin = {
  activated: vueComponentActivated,
}
