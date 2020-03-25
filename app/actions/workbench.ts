import { LaunchedFetchesAction } from '../store/api'

import {
  setCommitTitle,
  setCommitMessage
} from './mutations'

import {
  fetchBody,
  fetchCommitBody,
  fetchCommitDataset,
  fetchCommitStats,
  fetchCommitStatus,
  fetchHistory,
  fetchStats,
  fetchWorkingDataset,
  fetchWorkingStatus
} from './api'
import { setCommit } from './selections'

// fetchworkBench makes the necessary API requests to populate the workbench
// based on what we know about the working dataset from the state tree
// the returned promise resolves to true if loading thunks have been kicked off
export function fetchWorkbench (): LaunchedFetchesAction {
  return async (dispatch, getState) => {
    const { workingDataset, selections, commitDetails } = getState()
    const head = commitDetails
    const history = workingDataset.history
    let fetching: boolean = true

    if (!workingDataset.isLoading &&
       (selections.peername !== workingDataset.peername ||
        selections.name !== workingDataset.name)) {
      dispatch(fetchHistory())
      dispatch(fetchWorkingDataset())
      dispatch(fetchWorkingStatus())
      dispatch(fetchStats())
      dispatch(fetchBody(-1))
      dispatch(setCommitTitle(''))
      dispatch(setCommitMessage(''))
      return fetching
    }

    if (!head.isLoading &&
        (selections.peername !== head.peername ||
         selections.name !== head.name ||
         selections.commit !== head.path)) {
      dispatch(fetchCommitDataset())
      dispatch(fetchCommitStats())
      dispatch(fetchCommitStatus())
      dispatch(fetchCommitBody(-1))
      return fetching
    }

    if (selections.commit === '' && history.value.length !== 0) {
      dispatch(setCommit(history.value[0].path))
    }

    return false
  }
}
