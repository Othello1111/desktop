import React, { useState } from 'react'

import { RemoveDatasetModal } from '../../../app/models/modals'
import { connectComponentToProps } from '../../utils/connectComponentToProps'
import { dismissModal } from '../../actions/ui'
import { selectModal, selectSessionUsername } from '../../selections'
import { ApiAction } from '../../store/api'
import { removeDatasetsAndFetch } from '../../actions/api'

import CheckboxInput from '../form/CheckboxInput'
import Modal from './Modal'
import Error from './Error'
import Buttons from './Buttons'
import { VersionInfo } from '../../models/store'

interface RemoveDatasetProps {
  modal: RemoveDatasetModal
  sessionUsername: string
  onDismissed: () => void
  onSubmit: (refs: VersionInfo[], keepfiles: boolean) => Promise<ApiAction>
}

export const RemoveDatasetComponent: React.FC<RemoveDatasetProps> = (props: RemoveDatasetProps) => {
  const { modal: { datasets }, sessionUsername, onDismissed, onSubmit } = props

  const [keepFiles, setKeepFiles] = useState(true)
  const [dismissable, setDismissable] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isLinked = !!datasets.find(dataset => dataset.fsiPath)
  const isSingleDataset = datasets.length === 1

  const handleChanges = (name: string, value: boolean) => {
    setKeepFiles(!value)
  }

  const handleSubmit = async () => {
    setDismissable(false)
    setLoading(true)
    error && setError('')
    if (!onSubmit) return

    try {
      await onSubmit(datasets, keepFiles)
      setLoading(false)
      setDismissable(true)
      onDismissed()
    } catch (action) {
      setLoading(false)
      setDismissable(true)
      setError(action.payload.err.message)
    }
  }

  const datasetRefs = datasets.map((dataset, index) => (<span key={index}><br/><code key={index}>{dataset.username}/{dataset.name}</code></span>))
  const isDeletingSessionUserDataset = !!datasets.find(ds => ds.username === sessionUsername)

  return (
    <Modal
      id='remove-dataset'
      title={`Remove Dataset`}
      onDismissed={onDismissed}
      onSubmit={() => {}}
      dismissable={dismissable}
      setDismissable={setDismissable}
    >
      <div className='content-wrap'>
        <div className='content'>
          <div className='dialog-text-small'>
            <p>Are you sure you want to remove {datasetRefs}&nbsp;?</p>
            <br/><br/>
            {isDeletingSessionUserDataset && <div className='warning'>Warning: removing a dataset that you created means you cannot return to that dataset&apos;s history.</div>}
          </div>
          { isLinked &&
              <CheckboxInput
                name='should-remove-files'
                checked={!keepFiles}
                onChange={handleChanges}
                label={'Also remove dataset files from my local file system'}
              />
          }
        </div>
      </div>
      <p className='content-bottom submit-message'>
        { isSingleDataset && isLinked && !keepFiles && <span>Qri will delete dataset files in <strong>{datasets[0].fsiPath}</strong></span>}
      </p>
      <Error id='remove-dataset-error' text={error} />
      <Buttons
        cancelText='cancel'
        onCancel={onDismissed}
        submitText='Remove'
        onSubmit={handleSubmit}
        disabled={false}
        loading={loading}
      />
    </Modal>
  )
}

export default connectComponentToProps(
  RemoveDatasetComponent,
  (state: any, ownProps: RemoveDatasetProps) => {
    return {
      ...ownProps,
      modal: selectModal(state),
      sessionUsername: selectSessionUsername(state)
    }
  },
  {
    onDismissed: dismissModal,
    onSubmit: removeDatasetsAndFetch
  }
)
