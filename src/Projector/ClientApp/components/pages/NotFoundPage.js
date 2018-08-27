import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import { RaisedButton } from 'material-ui';
import { Link } from 'react-router';
import PageBase from './PageBase';

// This is the 404 Not Found component.
export default class NotFoundPage extends PageBase {
  constructor(props) {
    super(props, { isImmersive: true, title: "Page Not Found" });
  }

  renderPageContent() {
    return (
      <Card style={{ margin: '16px' }}>
        <CardTitle title="Oops!" subtitle="Not Found 404" />
        <CardText>
          We can't seem to find the page you're looking for.
        </CardText>
        <CardActions>
          <Link to="/"><RaisedButton label="Go Home" primary={true} /></Link>
        </CardActions>
      </Card>
    );
  }
};