import { Reducer, AnyAction } from 'redux'
import { WorkingDataset, DatasetStatus, ComponentStatus } from '../models/store'
import { apiActionTypes } from '../store/api'
import { withPagination } from './page'
import { ipcRenderer } from 'electron'

const initialState: WorkingDataset = {
  path: '',
  prevPath: '',
  peername: '',
  name: '',
  status: {},
  isLoading: true,
  linkpath: '',
  published: true,
  hasHistory: true,
  structure: null,
  components: {
    body: {
      value: [],
      pageInfo: {
        isFetching: true,
        page: 0,
        pageSize: 100,
        fetchedAll: false
      }
    },
    meta: {
      value: {}
    },
    schema: {
      value: {}
    }
  },
  history: {
    pageInfo: {
      isFetching: true,
      page: 0,
      fetchedAll: false,
      pageSize: 0
    },
    value: []
  }
}

const [DATASET_REQ, DATASET_SUCC, DATASET_FAIL] = apiActionTypes('dataset')
const [DATASET_HISTORY_REQ, DATASET_HISTORY_SUCC, DATASET_HISTORY_FAIL] = apiActionTypes('history')
const [DATASET_STATUS_REQ, DATASET_STATUS_SUCC, DATASET_STATUS_FAIL] = apiActionTypes('status')
const [DATASET_BODY_REQ, DATASET_BODY_SUCC, DATASET_BODY_FAIL] = apiActionTypes('body')
const [, ADD_SUCC] = apiActionTypes('add')

const workingDatasetsReducer: Reducer = (state = initialState, action: AnyAction): WorkingDataset | null => {
  switch (action.type) {
    case DATASET_REQ:
      return initialState
    case DATASET_SUCC || ADD_SUCC: // when adding a new dataset, set it as the new workingDataset
      const { name, path, peername, published, dataset, fsiPath } = action.payload.data

      // set electron menus
      ipcRenderer.send('block-menus', false) // unblock menus once we have a working dataset
      // some menus are contextual based on linked and published status
      ipcRenderer.send('set-working-dataset', {
        fsiPath,
        published
      })

      return {
        ...state,
        name,
        path,
        peername,
        published,
        linkpath: fsiPath || '',
        structure: dataset.structure,
        isLoading: false,
        components: {
          body: {
            pageInfo: {
              ...state.components.body.pageInfo
            },
            value: state.components.body.value
          },
          meta: {
            value: dataset.meta || {}
          },
          schema: {
            value: dataset.structure.schema
          }
        }
      }
    case DATASET_FAIL:
      return {
        ...state,
        isLoading: false
      }

    case DATASET_HISTORY_REQ:
      return {
        ...state,
        history: {
          ...state.history,
          pageInfo: withPagination(action, state.history.pageInfo),
          value: action.pageInfo.page === 1 ? [] : [].concat(state.history.value)
        }
      }
    case DATASET_HISTORY_SUCC:
      return {
        ...state,
        hasHistory: true,
        history: {
          ...state.history,
          value: state.history.value
            ? state.history.value.concat(action.payload.data)
            : action.payload.data,
          pageInfo: withPagination(action, state.history.pageInfo)
        }
      }
    case DATASET_HISTORY_FAIL:
      return {
        ...state,
        hasHistory: !action.payload.err.message.includes('no history'),
        history: {
          ...state.history,
          pageInfo: withPagination(action, state.history.pageInfo)
        }
      }

    case DATASET_STATUS_REQ:
      return state
    case DATASET_STATUS_SUCC:
      const statusObject: DatasetStatus = action.payload.data
        .reduce((obj: any, item: any): ComponentStatus => {
          const { component, filepath, status } = item
          obj[component] = { filepath, status }
          return obj
        }, {})
      return {
        ...state,
        status: statusObject
      }
    case DATASET_STATUS_FAIL:
      return state

    case DATASET_BODY_REQ:
      return {
        ...state,
        components: {
          ...state.components,
          body: {
            ...state.components.body,
            pageInfo: {
              ...state.components.body.pageInfo,
              isFetching: true,
              fetchedAll: false
            }
          }
        }
      }
    case DATASET_BODY_SUCC:
      const fetchedAll = action.payload.data.data.length < state.components.body.pageInfo.pageSize
      return {
        ...state,
        components: {
          ...state.components,
          body: {
            ...state.components.body,
            value: [
              ...state.components.body.value,
              ...action.payload.data.data
            ],
            pageInfo: {
              ...state.components.body.pageInfo,
              page: state.components.body.pageInfo.page + 1, // eslint-disable-line
              fetchedAll,
              isFetching: false
            }
          }
        }
      }
    case DATASET_BODY_FAIL:
      return {
        ...state,
        components: {
          ...state.components,
          body: {
            ...state.body,
            error: action.payload.err,
            pageInfo: {
              ...state.components.body.pageInfo,
              isFetching: false
            }
          }
        }
      }

    default:
      return state
  }
}

export default workingDatasetsReducer
