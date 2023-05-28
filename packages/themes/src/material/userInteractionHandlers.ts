import { FormKitNode } from '@formkit/core'

export default (node: FormKitNode) => {
  if (!node.context) return

  node.context.state.hover = false
  node.context.state.pressed = false
  node.context.state.focus = false

  node.context.handlers.hoverEnter = () => {
    if (!node.context) return

    node.context.state.hover = true
  }

  node.context.handlers.hoverLeave = () => {
    if (!node.context) return

    node.context.state.hover = false
  }

  node.context.handlers.pressedEnter = (e: PointerEvent) => {
    if (!node.context) return

    node.context.state.pressed = true;

    (e.target as Element).setPointerCapture(e.pointerId)
  }

  node.context.handlers.pressedLeave = (e: PointerEvent) => {
    if (!node.context) return

    node.context.state.pressed = false;

    (e.target as Element).releasePointerCapture(e.pointerId);
  }

  node.context.handlers.focusEnter = () => {
    if (!node.context) return

    node.context.state.focus = true
  }

  node.context.handlers.focusLeave = () => {
    if (!node.context) return

    node.context.state.focus = false
  }

  node.context.handlers.focusInput = (e: Event) => {
    if (!node.context || !node.props.id) return

    const inputEl = document.getElementById(node.props.id)

    if (!inputEl) return

    e.preventDefault();

    inputEl.focus()

    node.context.handlers.focusEnter()
  }
}
