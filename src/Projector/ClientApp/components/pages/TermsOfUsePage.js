import PageBase from './PageBase';
import Translate from '~/components/Translate';
import PageFooter from '~/components/PageFooter';

if (typeof window === 'object') {
  require('~/styles/terms-of-use-page.scss');
}

export default class TermsOfUsePage extends PageBase {
  constructor(props) {
    super(props, { title: "Terms of Use", isImmersive: false, backgroundStyle: '#EEE' });
  }

  renderPageContent() {
    return template();
  }
}

const template = () => (
  <div className="terms-of-use-page">
    <div className="page-container">
      <div className="page-heading">
        <Translate message="TERMS_OF_USE.PAGE_HEADING" />
      </div>
      <div className="terms-container">
        <div className="terms-block">
          {/* The introductory block. */}
          <div className="terms-heading">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.0.HEADING" />
          </div>

          <div className="terms-text">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.0.TEXT" />
          </div>
        </div>

        <div className="terms-block">
          <div className="terms-heading">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.1.HEADING" />
          </div>
          <div className="terms-text">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.1.TEXT" />
          </div>
        </div>

        <div className="terms-block">
          <div className="terms-heading">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.2.HEADING" />
          </div>
          <div className="terms-text">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.2.TEXT" />
          </div>
        </div>

        <div className="terms-block">
          <div className="terms-heading">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.3.HEADING" />
          </div>
          <div className="terms-text">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.3.TEXT" />
          </div>
        </div>

        <div className="terms-block">
          <div className="terms-heading">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.4.HEADING" />
          </div>
          <div className="terms-text">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.4.TEXT" />
          </div>
        </div>


        <div className="terms-block">
          <div className="terms-heading">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.5.HEADING" />
          </div>
          <div className="terms-text">
            <Translate message="TERMS_OF_USE.TERM_BLOCKS.5.TEXT" />
          </div>
        </div>

      </div>
    </div>

    <PageFooter />
  </div>
);