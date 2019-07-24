import { connect } from 'react-redux'
import Metadata from '../components/Metadata'
import Store from '../models/store'

const mapStateToProps = (state: Store) => {
  const { workingDataset } = state

  // get data for the currently selected component
  const meta = workingDataset.value.meta
  return { meta }
}

const actions = {}

export default connect(mapStateToProps, actions)(Metadata)