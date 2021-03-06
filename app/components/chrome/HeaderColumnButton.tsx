import React from 'react'
import classNames from 'classnames'
import ReactTooltip from 'react-tooltip'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/free-regular-svg-icons'

export interface HeaderColumnButtonProps {
  id?: string
  tooltip?: string
  label?: string
  icon?: IconDefinition | React.ReactElement | false
  disabled?: boolean
  onClick?: (event: React.MouseEvent) => void
  /**
   * default is 'md'
   */
  size: 'sm' | 'md'
}

const HeaderColumnButton: React.FunctionComponent<HeaderColumnButtonProps> = (props) => {
  const { id = '', icon, label, tooltip, disabled, onClick, size = 'md' } = props

  // The `ReactTooltip` component relies on the `data-for` and `data-tip` attributes
  // we need to rebuild `ReactTooltip` so that it can recognize the `data-for`
  // or `data-tip` attributes that are rendered in this component
  React.useEffect(ReactTooltip.rebuild, [])
  return (
    <div
      id={id}
      className={classNames('header-column', { disabled })}
      data-tip={tooltip}
      onClick={onClick}
    >
      {icon && (React.isValidElement(icon)
        ? (<div className='header-column-icon'>{icon}</div>)
        : <div className='header-column-icon'><FontAwesomeIcon icon={icon} size='lg'/></div>
      )}
      {label &&
        <div className='header-column-text'>
          <div className={classNames('label', { 'small': size === 'sm' })}>{label}</div>
        </div>
      }
    </div>
  )
}

export default HeaderColumnButton
