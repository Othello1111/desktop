import { connect } from 'react-redux'
import App, { AppProps } from '../components/App'
import Store from '../models/store'
import { push } from 'connected-react-router'

import {
  fetchMyDatasets,
  addDatasetAndFetch,
  linkDatasetAndFetch,
  pingApi,
  publishDataset,
  unpublishDataset,
  removeDatasetAndFetch,
  importFile
} from '../actions/api'

import {
  acceptTOS,
  setQriCloudAuthenticated,
  closeToast,
  setModal,
  setDatasetDirPath,
  setExportPath,
  signout
} from '../actions/ui'

import {
  bootstrap,
  signup
} from '../actions/session'

import {
  setWorkingDataset
} from '../actions/selections'

const mergeProps = (props: any, actions: any): AppProps => {
  return { ...props, ...actions }
}

const AppContainer = connect(
  (state: Store) => {
    const { ui, myDatasets, session, workingDataset, connection, selections } = state
    const { apiConnection } = connection
    const loading = connection.apiConnection === 0 || session.isLoading
    const hasDatasets = myDatasets.value.length !== 0
    const { toast, modal, datasetDirPath, exportPath } = ui

    return {
      hasDatasets,
      loading,
      session,
      selections,
      toast,
      modal,
      workingDataset,
      apiConnection,
      datasetDirPath,
      exportPath
    }
  },
  {
    bootstrap,
    fetchMyDatasets,
    acceptTOS,
    signup,
    push,
    setQriCloudAuthenticated,
    addDataset: addDatasetAndFetch,
    linkDataset: linkDatasetAndFetch,
    closeToast,
    pingApi,
    setWorkingDataset,
    setExportPath,
    setModal,
    publishDataset,
    unpublishDataset,
    removeDatasetAndFetch,
    setDatasetDirPath,
    signout,
    importFile
  },
  mergeProps
)(App)

export default AppContainer
