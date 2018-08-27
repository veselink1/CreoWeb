import { PureComponent } from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import HomePage from '~/components/pages/HomePage';
import NotFoundPage from '~/components/pages/NotFoundPage';
import LoginPage from '~/components/pages/LoginPage';
import SignupPage from '~/components/pages/SignupPage';
import DashboardPage from '~/components/pages/DashboardPage';
import EditorPage from '~/components/pages/EditorPage';
import TestPage from '~/components/pages/TestPage';
import TermsOfUsePage from '~/components/pages/TermsOfUsePage';

import { TranslationProvider } from '~/components/Translate';
import intl from '~/intl';

const PageWrapper = ({children}) => (
    <TranslationProvider translations={intl}>
        {children}
    </TranslationProvider>
);

// Application Routes
// If no match is found, NotFound will be used instead.
export default () => (
    <Route path="/" component={PageWrapper}>
        <IndexRoute component={HomePage} />
        <Route path="/Login" component={LoginPage} />
        <Route path="/Signup" component={SignupPage} />
        <Route path="/Dashboard" component={DashboardPage} />
        <Route path="/Editor" component={EditorPage} />
        <Route path="/Test" component={TestPage} />
        <Route path="/Policies/TermsOfUse" component={TermsOfUsePage} />
        <Route path="*" component={NotFoundPage} />
    </Route>
);