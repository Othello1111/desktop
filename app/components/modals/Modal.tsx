import React from 'react'
import classNames from 'classnames'
import ReactTooltip from 'react-tooltip'

import ModalHeader from './ModalHeader'

/**
 * Title bar height in pixels. Values taken from 'app/styles/_variables.scss'.
 */
const titleBarHeight = 22

/**
 * HOW TO USE MODALS
 *
 * Once you have created your modal component how do you wire it up to work in
 * the app?
 *
 * First, look at the `/app/models/modals.ts` file. You need to create a specific
 * `ModalType` for your new modal. Then, any parameters that you need so the
 * modal can function should be added as fields on the modal type.
 *
 * When you want the modal to appear, emit the `setModal` action, with the correct
 * modal type and appropriate details. That action will add the modal struct to
 * UI reducer. The App component will then get the modal struct. If the modal
 * struct is NOT of `NoModal` type, it will pass the modal struct to the `Modals`
 * component.
 *
 * You must add your new modal component to the `Modals` component. This component
 * switches on `type` to determine what modal to display.
 *
 * All modals should be containerized, aka, have a `connect` function that
 * connects the modal to the state tree. It is required to get its own modal struct
 * from the state tree (use the `selectModal` selector).
 *
 * Each modal should emit the `dismissModal` function to close the modal on cancel
 * or any other action that makes sense for the modal to close.
 *
 */
export interface ModalProps {
  /**
   * An optional dialog title. Most, if not all dialogs should have
   *  When present the Dialog renders a DialogHeader element
   * containing an icon (if the type prop warrants it), the title itself
   * and a close button (if the dialog is dismissable).
   *
   * By omitting this consumers may use their own custom DialogHeader
   * for when the default component doesn't cut it.
   */
  readonly title?: string | JSX.Element

  /**
   * Whether or not the dialog should be dismissable. A dismissable dialog
   * can be dismissed either by clicking on the backdrop or by clicking
   * the close button in the header (if a header was specified). Dismissal
   * will trigger the onDismissed event which callers must handle and pass
   * on to the dispatcher in order to close the dialog.
   *
   * A non-dismissable dialog can only be closed by means of the component
   * implementing a dialog. An example would be a critical error or warning
   * that requires explicit user action by for example clicking on a button.
   *
   * Defaults to true if omitted.
   */
  readonly dismissable?: boolean

  /**
   * Event triggered when submitting using the form submit, sets dismissible
   * false when we have submitted and true when we get a response
   */
  readonly setDismissable?: (dismissable: boolean) => void

  /**
   * Event triggered when the dialog is dismissed by the user in the
   * ways described in the dismissable prop.
   */
  readonly onDismissed: () => void

  /**
   * An optional id for the rendered dialog element.
   */
  readonly id?: string

  /**
   * An optional dialog type. A warning or error dialog type triggers custom
   * styling of the dialog, see _dialog.scss for more detail.
   *
   * Defaults to 'normal' if omitted
   */
  readonly type?: 'normal' | 'warning' | 'error'

  /**
   * An event triggered when the dialog form is submitted. All dialogs contain
   * a top-level form element which can be triggered through a submit button.
   *
   * Consumers should handle this rather than subscribing to the onClick event
   * on the button itself since there may be other ways of submitting a specific
   * form (such as Ctrl+Enter).
   */
  readonly onSubmit?: () => void

  /**
   * An optional className to be applied to the rendered dialog element.
   */
  readonly className?: string
  readonly disabled?: boolean
  readonly loading?: boolean

  /**
   * Some modals may want greater control over their styling. When
   * `noContentPadding` is true, remove the padding around the content
   * so the content is more seamless
   */
  readonly noContentPadding?: boolean

  /**
   * Setting the dialog to be max size: 70% by 70%
   */
  readonly maxSize?: boolean

}

/**
 * A general purpose, versatile, dialog component which utilizes the new
 * <dialog> element. See https://demo.agektmr.com/dialog/
 *
 * A dialog is opened as a modal that prevents keyboard or pointer access to
 * underlying elements. It's not possible to use the tab key to move focus
 * out of the dialog without first dismissing it.
 */
const Modal: React.FC<ModalProps> = (props) => {
  const {
    title,
    dismissable = false,
    setDismissable,
    onDismissed,
    id,
    type,
    onSubmit,
    className,
    disabled,
    loading,
    children,
    noContentPadding = false,
    maxSize = false
  } = props

  const [modalElement, setModalElement] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (modalElement) {
      (modalElement as any).showModal()
    }
  }, [modalElement]) // eslint-disable-line

  const onDialogCancel = (e: Event) => {
    e.preventDefault()
    onDismiss()
  }

  const onModalClick = (e: React.MouseEvent<HTMLElement>) => {
    if (dismissable === false) {
      return
    }

    // This event handler catches the onClick event of buttons in the
    // dialog. Ie, if someone hits enter inside the dialog form an onClick
    // event will be raised on the the submit button which isn't what we
    // want so we'll make sure that the original target for the event is
    // our own dialog element.
    if (e.target !== modalElement) {
      return
    }

    const isInTitleBar = e.clientY <= titleBarHeight

    if (isInTitleBar) {
      return
    }

    // Figure out if the user clicked on the backdrop or in the dialog itself.
    const rect = e.currentTarget.getBoundingClientRect()

    // http://stackoverflow.com/a/26984690/2114
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width

    if (!isInDialog) {
      e.preventDefault()
      onDismiss()
    }
  }

  const onModalRef = (e: HTMLElement | null) => {
    // We need to explicitly subscribe to and unsubscribe from the dialog
    // element as react doesn't yet understand the element and which events
    // it has.
    if (!e) {
      if (modalElement) {
        modalElement.removeEventListener('cancel', onDialogCancel)
        modalElement.removeEventListener('keydown', onKeyDown)
      }
    } else {
      e.addEventListener('cancel', onDialogCancel)
      e.addEventListener('keydown', onKeyDown)
    }

    setModalElement(e)
  }

  const onKeyDown = (event: KeyboardEvent) => {
    const shortcutKey = event.metaKey
    if ((shortcutKey && event.key === 'w') || event.key === 'Escape') {
      onDialogCancel(event)
    }
  }

  const onDismiss = () => {
    if (dismissable) {
      if (onDismissed) {
        onDismissed()
      }
    }
  }

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (onSubmit) {
      if (setDismissable) setDismissable(false)
      new Promise((resolve) => {
        onSubmit()
        resolve()
      }).then(() => { if (setDismissable) setDismissable(true) })
    } else {
      onDismiss()
    }
  }

  const renderHeader = () => {
    if (!title) {
      return null
    }

    return (
      <ModalHeader
        title={title}
        dismissable={dismissable}
        onDismissed={onDismiss}
        loading={loading}
      />
    )
  }

  const modalClassName = classNames(
    {
      error: type === 'error',
      warning: type === 'warning'
    },
    className
  )

  const content = onSubmit ? <form className={classNames({ 'no-padding': noContentPadding })}onSubmit={onFormSubmit}>
    <fieldset disabled={disabled}>
      {children}
    </fieldset>
  </form> : children

  // we are rendering a second instance of ReactTooltip here because the modal
  // is displayed in a <dialog> element, which always wants to live above the
  // rest of the page. To add tooltips in a modal, add data-tip='string' and
  // data-for='modal-tooltip' (the id of the ReactTooltip instance)

  return (
    <dialog
      open={false}
      ref={onModalRef}
      id={id}
      onMouseDown={onModalClick}
      className={classNames(modalClassName, { 'max': maxSize })}
    >
      {renderHeader()}
      {content}
      <ReactTooltip
        id='modal-tooltip'
        place='top'
        type='dark'
        effect='solid'
        delayShow={500}
        multiline
      />
    </dialog>
  )
}

export default Modal
