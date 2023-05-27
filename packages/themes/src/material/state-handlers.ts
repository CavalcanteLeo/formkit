import { FormKitNode } from "@formkit/core"

export const hoverStateHandler = (node: FormKitNode) => {
  if (!node.context) return

  node.context.state.hover = false

  node.context.handlers.onHoverEnter = () => {
    if (node.context) node.context.state.hover = true
  }

  node.context.handlers.onHoverLeave = () => {
    if (node.context) node.context.state.hover = false
  }
}

export const pressedStateHandler = (node: FormKitNode) => {
  if (!node.context) return

  node.context.state.pressed = false

  node.context.handlers.onPressedEnter = () => {
    if (node.context) node.context.state.pressed = true
  }

  node.context.handlers.onPressedLeave = () => {
    if (node.context) node.context.state.pressed = false
  }
}

export const focusStateHandler = (node: FormKitNode) => {
  if (!node.context) return

  node.context.state.focus = false

  node.context.handlers.onFocusEnter = (e: Event) => {
    if (!node.context || !node.props.id) return

    const inputEl = document.getElementById(node.props.id)

    if (!inputEl) return

    e.preventDefault();

    inputEl.focus()
    node.context.state.focus = true
  }

  node.context.handlers.onFocusLeave = () => {
    if (node.context) node.context.state.focus = false
  }
}
