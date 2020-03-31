// globals __BUILD__
import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { ipcRenderer } from 'electron'
import Welcome from './components/onboard/Welcome'
import Signup from './components/onboard/Signup'
import Signin from './components/Signin'
import CollectionContainer from './containers/CollectionContainer'
import WorkbenchContainer from './containers/WorkbenchContainer'
import NetworkContainer from './containers/NetworkContainer'
import Compare from './components/compare/Compare'

export default function Routes (props: any) {
  const {
    hasAcceptedTOS,
    qriCloudAuthenticated,
    setQriCloudAuthenticated,
    acceptTOS,
    signup,
    signin,
    setModal
  } = props

  const requireSignin = (dest: React.ReactElement): React.ReactElement => {
    // require onboarding is complete & valid login before viewing any section
    if (!hasAcceptedTOS) return <Redirect to='/onboard' />
    if (!qriCloudAuthenticated) return <Redirect to='/onboard/signup' />
    return dest
  }

  const sectionElement = (section: string, dest: React.ReactElement): React.ReactElement => {
    ipcRenderer.send('show-dataset-menu', (section === 'workbench'))
    return requireSignin(dest)
  }

  return (
    <div className='route-content'>
      <Switch>
        {/* Onboarding */}
        <Route exact path='/onboard' render={() => {
          if (hasAcceptedTOS) return <Redirect to='/onboard/signup' />
          return <Welcome onAccept={acceptTOS} />
        }} />
        <Route exact path='/onboard/signup' render={() => {
          if (!hasAcceptedTOS) return <Redirect to='/onboard' />
          if (qriCloudAuthenticated) return <Redirect to='/collection' />
          return <Signup signup={signup} onSuccess={setQriCloudAuthenticated} />
        }} />

        {/* Sign in */}
        <Route exact path='/signin' render={() => {
          if (!hasAcceptedTOS) return <Redirect to='/onboard' />
          if (qriCloudAuthenticated) return <Redirect to='/collection' />
          return <Signin signin={signin} onSuccess={setQriCloudAuthenticated} />
        }} />

        {/* App Sections */}
        <Route path='/network/:username/:name/at/ipfs/:path' render={(props) => {
          return sectionElement('network', <NetworkContainer {...props} />)
        }} />
        <Route path='/network/:username/:name' render={(props) => {
          return sectionElement('network', <NetworkContainer {...props} />)
        }} />
        <Route exact path='/network' render={(props) => {
          return sectionElement('network', <NetworkContainer {...props} />)
        }} />

        <Route exact path='/collection' render={() => {
          return sectionElement('collection', <CollectionContainer setModal={setModal} />)
        }} />
        <Route path='/collection/:username' render={(props) => {
          return sectionElement('collection', <Placeholder
            title='Collection User Datasets'
            pathname={props.location.pathname}
          />)
        }} />

        <Route exact path='/workbench' render={(props) => {
          return sectionElement('workbench', <WorkbenchContainer {...props} />)
        }}/>
        <Route path='/workbench/:username/:name' render={(props) => {
          return sectionElement('workbench', <WorkbenchContainer {...props} />)
        }}/>

        { __BUILD__.ENABLE_COMPARE_SECTION &&
          <Route exact path='/compare' render={(props) => sectionElement('compare', <Compare {...props} />)} />
        }

        <Route path='/' render={() => {
          ipcRenderer.send('show-dataset-menu', false)
          return requireSignin(<Redirect to='/collection' />)
        }} />
      </Switch>
    </div>
  )
}

interface PlaceholderProps {
  title: string
  pathname: string
}

const Placeholder: React.FunctionComponent<PlaceholderProps> = ({ title, pathname }) => {
  return <div className='container dataset'>
    <h1>{title}</h1>
    <i>a placeholder for: {pathname}</i>
  </div>
}
