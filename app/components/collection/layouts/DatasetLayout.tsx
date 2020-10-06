import React from 'react'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

import Store from '../../../models/store'
import { connectComponentToProps } from '../../../utils/connectComponentToProps'
import { setModal, setSidebarWidth } from '../../../actions/ui'
import {
  selectSidebarWidth,
  selectDatasetRef
} from '../../../selections'
import { Modal, ModalType } from '../../../models/modals'

import DatasetSidebar from './DatasetSidebar'
import Layout from '../../Layout'
import LinkButton from '../headerButtons/LinkButton'
import PublishButton from '../headerButtons/PublishButton'

interface DatasetLayoutProps {
  // from connect
  sidebarWidth?: number
  qriRef?: QriRef
  onSidebarResize?: (width: number) => void
  setModal: (modal: Modal) => void
  // from props
  id: string
  mainContent: React.ReactElement
  sidebarContent: React.ReactElement
  activeTab: string
  headerContent?: React.ReactElement
}

const DatasetLayoutComponent: React.FunctionComponent<DatasetLayoutProps> = (props) => {
  const {
    id,
    mainContent,
    headerContent,
    sidebarWidth = 0,
    qriRef = { username: '', name: '', path: '' },
    onSidebarResize,
    setModal
  } = props

  const buttons = [
    {
      type: 'button',
      id: 'pull-dataset',
      icon: faDownload,
      label: 'Export',
      onClick: () => { setModal({ type: ModalType.ExportDataset }) }
    },
    { type: 'component', component: <LinkButton key='link-button' /> },
    { type: 'component', component: <PublishButton key='publish-button' /> }
  ]

  return (
    <Layout
      id={id}
      subTitle={`${qriRef.username}/`}
      title={qriRef.name}
      sidebarWidth={sidebarWidth}
      headerContent={headerContent}
      onSidebarResize={onSidebarResize}
      mainContent={mainContent}
      sidebarContent={<DatasetSidebar />}
      topbarButtons={buttons}
    />
  )
}

export default connectComponentToProps(
  DatasetLayoutComponent,
  (state: Store, ownProps: DatasetLayoutProps) => {
    return {
      ...ownProps,
      qriRef: selectDatasetRef(state),
      sidebarWidth: selectSidebarWidth(state, 'workbench')
    }
  },
  {
    onSidebarResize: (width: number) => setSidebarWidth('workbench', width),
    setModal
  }
)
