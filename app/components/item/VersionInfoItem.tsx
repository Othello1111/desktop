import React from 'react'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons'

import { VersionInfo } from '../../models/store'

import { DatasetDetailsSubtext } from '../dataset/DatasetDetailsSubtext'

interface VersionInfoItemProps {
  data: VersionInfo
  selected?: boolean

  onClick: (data: VersionInfo, e?: React.MouseEvent) => void
}

const VersionInfoItem: React.FunctionComponent<VersionInfoItemProps> = ({ data, selected = false, onClick }) => {
  const { username, name } = data
  return (
    <div
      id={`${username}-${name}`}
      key={`${username}/${name}`}
      className={classNames('sidebar-list-item', 'sidebar-list-item-text', {
        'selected': selected
      })}
      onClick={(e: React.MouseEvent) => { onClick(data, e) }}
    >
      <div className='icon-column'>
        <FontAwesomeIcon icon={faFileAlt} size='lg'/>
      </div>
      <div className='text-column'>
        <div className='text'>{username}/{name}</div>
        <DatasetDetailsSubtext data={data} />
      </div>
    </div>
  )
}

export default VersionInfoItem
